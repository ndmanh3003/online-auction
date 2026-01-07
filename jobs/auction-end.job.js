import Product from '../models/Product.js'
import Transaction from '../models/Transaction.js'
import * as emailService from '../utils/email.js'

export async function checkEndedAuctions() {
  try {
    const now = new Date()
    const endedProducts = await Product.find({
      status: 'active',
      endTime: { $lte: now },
    }).populate('sellerId', 'name email')

    for (const product of endedProducts) {
      await Product.findByIdAndUpdate(product._id, { status: 'ended' })

      if (product.currentWinnerId) {
        const transaction = new Transaction({
          productId: product._id,
          sellerId: product.sellerId._id,
          winnerId: product.currentWinnerId._id,
        })
        await transaction.save()

        await product.populate('currentWinnerId')
        emailService.sendAuctionEndedWithWinnerEmail(
          product,
          product.currentWinnerId
        )
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

setInterval(checkEndedAuctions, 1 * 1000)

console.log('Auction end detection job started. Checking every minute...')
