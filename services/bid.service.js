import AuctionConfig from '../models/AuctionConfig.js'
import AutoBid from '../models/AutoBid.js'
import Product from '../models/Product.js'
import Rating from '../models/Rating.js'

function computeMinAllowedMax(product, currentPrice) {
  return currentPrice + product.stepPrice
}

function pickTopTwo(candidates) {
  if (!candidates.length) return { top1: null, top2: null }
  const sorted = [...candidates].sort((a, b) => {
    if (b.maxBidAmount !== a.maxBidAmount)
      return b.maxBidAmount - a.maxBidAmount
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
  return { top1: sorted[0] ?? null, top2: sorted[1] ?? null }
}

function computeDisplayedPrice({
  product,
  top1,
  top2,
  startPrice,
  currentPrice,
}) {
  if (!top1) return { winnerId: null, newPrice: currentPrice }

  if (!top2) {
    const minPrice = Math.max(startPrice, currentPrice + product.stepPrice)
    return {
      winnerId: top1.bidderId,
      newPrice: Math.min(top1.maxBidAmount, minPrice),
    }
  }

  const target = top2.maxBidAmount + product.stepPrice
  return {
    winnerId: top1.bidderId,
    newPrice: Math.min(top1.maxBidAmount, target),
  }
}

async function getOrCreateConfig() {
  let config = await AuctionConfig.findOne()
  if (!config) {
    config = await AuctionConfig.create({
      autoExtendThresholdMinutes: 5,
      autoExtendDurationMinutes: 10,
      sellerDurationDays: 7,
      newProductHighlightMinutes: 30,
      minRatingPercentForBid: 80,
    })
  }
  return config
}

async function getUserRatingPercent(bidderId) {
  const [positive, negative] = await Promise.all([
    Rating.countDocuments({ toUserId: bidderId, rating: 1 }),
    Rating.countDocuments({ toUserId: bidderId, rating: -1 }),
  ])
  const total = positive + negative
  const percent = total > 0 ? (positive / total) * 100 : 0
  return { positive, negative, total, percent }
}

async function recomputeWinner(productId) {
  const product = await Product.findById(productId)
  if (!product || product.status !== 'active') return null

  const startPrice = product.startPrice
  const currentPrice = product.currentPrice

  const blockedIds = (product.blockedBidders ?? []).map((x) => x.toString())
  const candidates = await AutoBid.find({
    productId,
    bidderId: { $nin: blockedIds },
  })
    .select({ bidderId: 1, maxBidAmount: 1, createdAt: 1 })
    .lean()

  const { top1, top2 } = pickTopTwo(candidates)

  const { winnerId, newPrice } = computeDisplayedPrice({
    product,
    top1,
    top2,
    startPrice,
    currentPrice,
  })

  const prevWinner = product.currentWinnerId?.toString()
  const nextWinner = winnerId?.toString() ?? null
  const priceChanged = Number(newPrice) !== Number(currentPrice)
  const winnerChanged = prevWinner !== nextWinner

  if (priceChanged || winnerChanged) {
    if (winnerId) {
      product.bids = product.bids || []
      product.bids.push({
        bidderId: winnerId,
        bidAmount: newPrice,
        createdAt: new Date(),
      })
    }

    product.currentPrice = newPrice
    product.currentWinnerId = winnerId
    await product.save()
  }

  return {
    priceChanged,
    winnerChanged,
    currentPrice: product.currentPrice,
    currentWinnerId: product.currentWinnerId,
  }
}

export async function placeBid(productId, bidderId, maxBidAmount) {
  const config = await getOrCreateConfig()

  const product = await Product.findById(productId)
  if (!product) throw new Error('Product not found')
  if (product.status !== 'active') throw new Error('Auction has ended')
  if (new Date() > product.endTime) throw new Error('Auction has ended')

  if (product.sellerId.toString() === bidderId.toString()) {
    throw new Error('Seller cannot bid on their own product')
  }
  if (
    product.blockedBidders?.some((x) => x.toString() === bidderId.toString())
  ) {
    throw new Error('You are blocked from bidding on this product')
  }

  const userRating = await getUserRatingPercent(bidderId)
  const minPercent = config.minRatingPercentForBid

  if (userRating.total === 0) {
    if (!product.allowNonRatedBidders)
      throw new Error('This auction does not allow non-rated bidders')
  } else if (userRating.percent < minPercent) {
    throw new Error(`Minimum ${minPercent}% positive rating required`)
  }

  const startPrice = product.startPrice
  const currentPrice = product.currentPrice

  const minAllowedMax = computeMinAllowedMax(product, currentPrice)
  if (maxBidAmount < minAllowedMax) {
    throw new Error(`Maximum bid amount must be at least ${minAllowedMax}`)
  }

  const existingAutoBid = await AutoBid.findOne({ productId, bidderId })
  const prevMaxBidAmount = existingAutoBid?.maxBidAmount || 0

  await AutoBid.findOneAndUpdate(
    { productId, bidderId },
    { $set: { maxBidAmount } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  const blockedIds = (product.blockedBidders ?? []).map((x) => x.toString())
  const candidates = await AutoBid.find({
    productId,
    bidderId: { $nin: blockedIds },
  })
    .select({ bidderId: 1, maxBidAmount: 1, createdAt: 1 })
    .lean()

  const { top1, top2 } = pickTopTwo(candidates)

  const { winnerId, newPrice } = computeDisplayedPrice({
    product,
    top1,
    top2,
    startPrice,
    currentPrice,
  })

  const prevWinner = product.currentWinnerId?.toString()
  const nextWinner = winnerId?.toString() ?? null
  const priceChanged = Number(newPrice) !== Number(currentPrice)
  const winnerChanged = prevWinner !== nextWinner
  const isUpdatingBidder = bidderId.toString() === nextWinner

  if (priceChanged || winnerChanged) {
    if (winnerId) {
      product.bids = product.bids || []
      product.bids.push({
        bidderId: winnerId,
        bidAmount: newPrice,
        createdAt: new Date(),
      })
    }

    product.currentPrice = newPrice
    product.currentWinnerId = winnerId
  } else if (
    isUpdatingBidder &&
    winnerId &&
    winnerId.toString() === bidderId.toString() &&
    maxBidAmount > prevMaxBidAmount
  ) {
    product.bids = product.bids || []
    product.bids.push({
      bidderId: winnerId,
      bidAmount: currentPrice,
      createdAt: new Date(),
    })
  }

  if (product.autoExtend) {
    const thresholdMs = config.autoExtendThresholdMinutes * 60 * 1000
    const extendMs = config.autoExtendDurationMinutes * 60 * 1000
    const thresholdTime = new Date(product.endTime.getTime() - thresholdMs)
    if (new Date() >= thresholdTime) {
      product.endTime = new Date(product.endTime.getTime() + extendMs)
    }
  }

  await product.save()

  return {
    success: true,
    message: priceChanged || winnerChanged ? 'Bid placed' : 'Max bid updated',
    currentPrice: product.currentPrice,
    currentWinnerId: product.currentWinnerId,
    endTime: product.endTime,
  }
}

export async function recomputeWinnerAfterBlock(productId) {
  return await recomputeWinner(productId)
}
