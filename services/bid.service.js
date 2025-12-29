import AuctionConfig from '../models/AuctionConfig.js'
import AutoBid from '../models/AutoBid.js'
import Product from '../models/Product.js'

/* =====================================================
 * Helpers – pure logic / reusable
 * ===================================================== */

export function computeMinAllowedMax(product) {
  return product.currentPrice + product.stepPrice
}

function pickTopTwo(candidates = []) {
  const sorted = [...candidates].sort((a, b) => {
    if (b.maxBidAmount !== a.maxBidAmount) {
      return b.maxBidAmount - a.maxBidAmount
    }
    return new Date(a.createdAt) - new Date(b.createdAt)
  })

  return {
    top1: sorted[0] ?? null,
    top2: sorted[1] ?? null,
  }
}

function computeDisplayedPrice({ product, top1, top2 }) {
  const { startPrice, currentPrice, stepPrice } = product

  if (!top1) {
    return { winnerId: null, newPrice: currentPrice }
  }

  // Only one bidder
  if (!top2) {
    const minPrice = Math.max(startPrice, currentPrice + stepPrice)
    return {
      winnerId: top1.bidderId,
      newPrice: Math.min(top1.maxBidAmount, minPrice),
    }
  }

  // Two or more bidders
  const target = top2.maxBidAmount + stepPrice
  return {
    winnerId: top1.bidderId,
    newPrice: Math.min(top1.maxBidAmount, target),
  }
}

function applyWinnerChange(product, { winnerId, newPrice }) {
  const prevWinner = product.currentWinnerId?.toString() ?? null
  const nextWinner = winnerId?.toString() ?? null

  const priceChanged = Number(product.currentPrice) !== Number(newPrice)
  const winnerChanged = prevWinner !== nextWinner

  if (!priceChanged && !winnerChanged) {
    return { priceChanged: false, winnerChanged: false }
  }

  if (winnerId) {
    product.bids ??= []
    product.bids.push({
      bidderId: winnerId,
      bidAmount: newPrice,
      createdAt: new Date(),
    })
  }

  product.currentPrice = newPrice
  product.currentWinnerId = winnerId

  return { priceChanged, winnerChanged }
}

/* =====================================================
 * Exported APIs
 * ===================================================== */

export async function autoCalculate(productId) {
  const product = await Product.findById(productId)
  if (!product || product.status !== 'active') return null

  const blockedIds = (product.blockedBidders ?? []).map(String)
  const candidates = await AutoBid.find({
    productId: product._id,
    bidderId: { $nin: blockedIds },
  })
    .select({ bidderId: 1, maxBidAmount: 1, createdAt: 1 })
    .lean()

  const { top1, top2 } = pickTopTwo(candidates)
  const result = computeDisplayedPrice({ product, top1, top2 })
  const change = applyWinnerChange(product, result)

  if (change.priceChanged || change.winnerChanged) {
    await product.save()
  }

  return {
    ...change,
    currentPrice: product.currentPrice,
    currentWinnerId: product.currentWinnerId,
  }
}

export async function placeBid(productId, bidderId, maxBidAmount) {
  const existingAutoBid = await AutoBid.findOne({ productId, bidderId })
  const prevMaxBidAmount = existingAutoBid?.maxBidAmount ?? 0

  await AutoBid.findOneAndUpdate(
    { productId, bidderId },
    { $set: { maxBidAmount } },
    { upsert: true, setDefaultsOnInsert: true }
  )

  const change = await autoCalculate(productId)

  /* ===== Case: user only updates max bid while already winning ===== */
  if (
    !change.priceChanged &&
    change.currentWinnerId?.toString() === bidderId.toString() &&
    maxBidAmount > prevMaxBidAmount
  ) {
    await Product.findByIdAndUpdate(productId, {
      $push: {
        bids: {
          bidderId,
          bidAmount: change.currentPrice,
          createdAt: new Date(),
        },
      },
    })
  }

  /* ===== Auto extend auction ===== */
  const config = await AuctionConfig.findOne()
  const product = await Product.findById(productId)
  if (product.autoExtend) {
    const thresholdMs = config.autoExtendThresholdMinutes * 60 * 1000
    const extendMs = config.autoExtendDurationMinutes * 60 * 1000

    if (Date.now() >= product.endTime.getTime() - thresholdMs) {
      product.endTime = new Date(product.endTime.getTime() + extendMs)
      await product.save()
    }
  }

  return {
    success: true,
    message:
      change.priceChanged || change.winnerChanged
        ? 'Bid placed'
        : 'Max bid updated',
    currentPrice: change.currentPrice,
    currentWinnerId: change.currentWinnerId,
    endTime: product.endTime,
  }
}
