import Product from '../models/Product.js';
import * as bidService from '../services/bid.service.js';
import * as transactionService from '../services/transaction.service.js';
import * as emailService from '../utils/email.js';

export async function checkEndedAuctions() {
  try {
    const now = new Date();
    const endedProducts = await Product.find({
      status: 'active',
      endTime: { $lte: now },
    }).populate('sellerId', 'name email');

    for (const product of endedProducts) {
      await Product.findByIdAndUpdate(product._id, { status: 'ended' });

      const topBid = await bidService.getTopBidder(product._id);

      if (topBid) {
        await transactionService.create({
          productId: product._id,
          sellerId: product.sellerId._id,
          winnerId: topBid.bidderId._id,
        });

        await emailService.sendAuctionEndedWithWinnerEmail(product, topBid.bidderId);
      } else {
        await emailService.sendAuctionEndedNoWinnerEmail(product);
      }
    }

    console.log(`Checked ${endedProducts.length} ended auctions at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error checking ended auctions:', error);
  }
}

setInterval(checkEndedAuctions, 600 * 1000);

console.log('Auction end detection job started. Checking every minute...');

