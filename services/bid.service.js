import mongoose from 'mongoose'
import AuctionConfig from '../models/AuctionConfig.js'
import AutoBid from '../models/AutoBid.js'
import Product from '../models/Product.js'

function toObjectId(value) {
  if (!value) return null
  if (value instanceof mongoose.Types.ObjectId) return value
  if (typeof value === 'object' && value._id) return value._id
  if (typeof value === 'string' && value.length === 24) {
    return new mongoose.Types.ObjectId(value)
  }
  return null
}

export function computeMinAllowedMax(product) {
  if (!product.currentPrice || product.currentPrice === 0) {
    return product.startPrice
  }
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
    return { winnerId: null, newPrice: 0 }
  }

  const winnerId = toObjectId(top1.bidderId)
  if (!winnerId) {
    return { winnerId: null, newPrice: currentPrice }
  }

  if (!top2) {
    const minPrice = Math.max(startPrice, currentPrice + stepPrice)
    return {
      winnerId,
      newPrice: Math.min(top1.maxBidAmount, minPrice),
    }
  }

  const target = top2.maxBidAmount + stepPrice
  return {
    winnerId,
    newPrice: Math.min(top1.maxBidAmount, target),
  }
}

export async function autoCalculate(productId) {
  const product = await Product.findById(productId).lean()
  if (!product || product.status !== 'active') return null

  const currentWinnerIdObj = toObjectId(product.currentWinnerId)
  const blockedIds = (product.blockedBidders ?? []).map(String)
  const candidates = await AutoBid.find({
    productId: product._id,
    bidderId: { $nin: blockedIds },
  })
    .select({ bidderId: 1, maxBidAmount: 1, createdAt: 1 })
    .lean()

  candidates.forEach((candidate) => {
    candidate.bidderId = toObjectId(candidate.bidderId)
  })

  const { top1, top2 } = pickTopTwo(candidates)
  const result = computeDisplayedPrice({ product, top1, top2 })

  const newPrice = result.newPrice
  const newWinnerId = result.winnerId
  const prevWinner = currentWinnerIdObj?.toString() ?? null
  const nextWinner = newWinnerId?.toString() ?? null
  const priceChanged = Number(product.currentPrice) !== Number(newPrice)
  const winnerChanged = prevWinner !== nextWinner

  const updateData = {
    currentPrice: newPrice,
    currentWinnerId: newWinnerId,
  }

  if (priceChanged || winnerChanged) {
    if (newWinnerId) {
      updateData.$push = {
        bids: {
          bidderId: newWinnerId,
          bidAmount: newPrice,
          createdAt: new Date(),
        },
      }
    }
  }

  await Product.findByIdAndUpdate(productId, updateData, { new: false })

  return {
    priceChanged,
    winnerChanged,
    currentPrice: newPrice,
    currentWinnerId: newWinnerId,
  }
}

export async function placeBid(productId, bidderId, maxBidAmount) {
  await AutoBid.findOneAndUpdate(
    { productId, bidderId },
    { $set: { maxBidAmount } },
    { upsert: true, setDefaultsOnInsert: true }
  )

  const change = await autoCalculate(productId)

  if (!change) {
    const product = await Product.findById(productId).lean()
    return {
      success: true,
      message: 'Max bid updated',
      currentPrice: product.currentPrice,
      currentWinnerId: product.currentWinnerId,
      endTime: product.endTime,
    }
  }

  const updatedProduct = await Product.findById(productId)
  updatedProduct.currentWinnerId = toObjectId(updatedProduct.currentWinnerId)

  const config = await AuctionConfig.findOne()
  if (updatedProduct && updatedProduct.autoExtend) {
    const thresholdMs = config.autoExtendThresholdMinutes * 60 * 1000
    const extendMs = config.autoExtendDurationMinutes * 60 * 1000

    if (Date.now() >= updatedProduct.endTime.getTime() - thresholdMs) {
      updatedProduct.endTime = new Date(
        updatedProduct.endTime.getTime() + extendMs
      )
      await updatedProduct.save()
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
    endTime: updatedProduct.endTime,
  }
}
