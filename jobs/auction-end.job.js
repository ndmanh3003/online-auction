import Product from '../models/Product.js'
import Transaction from '../models/Transaction.js'
import * as emailService from '../utils/email.js'
import { processBids } from '../utils/bids.js'

export async function checkEndedAuctions() {
  try {
    const now = new Date()
    const endedProducts = await Product.find({
      status: 'active',
      endTime: { $lte: now },
    }).populate('sellerId', 'name email')

    for (const product of endedProducts) {
      await Product.findByIdAndUpdate(product._id, { status: 'ended' })

      await product.populate('bids.bidderId')
      const bidsResult = processBids(product, { query: { page: 1, limit: 1 } })
      const topBid = bidsResult.topBidder

            if (topBid) {
              const transaction = new Transaction({
                productId: product._id,
                sellerId: product.sellerId._id,
                winnerId: topBid.bidderId._id,
              })
              await transaction.save()

        emailService.sendAuctionEndedWithWinnerEmail(product, topBid.bidderId)
      } else {
        emailService.sendAuctionEndedNoWinnerEmail(product)
      }
    }

    console.log(
      `Checked ${
        endedProducts.length
      } ended auctions at ${new Date().toISOString()}`
    )
  } catch (error) {
    console.error('Error checking ended auctions:', error)
  }
}

setInterval(checkEndedAuctions, 600 * 1000)

console.log('Auction end detection job started. Checking every minute...')
