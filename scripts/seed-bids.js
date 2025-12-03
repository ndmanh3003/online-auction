import 'dotenv/config';
import './../utils/db.js';
import Bid from '../models/Bid.js';
import Product from '../models/Product.js';

export const seedBids = async (products, bidders) => {
  try {
    console.log('Starting bid seed...');

    await Bid.deleteMany({});
    console.log('Cleared existing bids');

    const bids = [];
    let totalBidsCreated = 0;

    for (const product of products) {
      const numBids = 5 + Math.floor(Math.random() * 5);
      const shuffledBidders = [...bidders].sort(() => Math.random() - 0.5);
      
      let currentPrice = product.startPrice;
      const createdAt = new Date(product.createdAt);

      for (let i = 0; i < numBids && i < shuffledBidders.length; i++) {
        const bidAmount = currentPrice + product.stepPrice * (1 + Math.floor(Math.random() * 3));
        const hasMaxBid = Math.random() > 0.7;
        const maxBidAmount = hasMaxBid ? bidAmount + product.stepPrice * (2 + Math.floor(Math.random() * 5)) : null;
        
        const bidTime = new Date(createdAt.getTime() + (i + 1) * 3600000 + Math.random() * 1800000);

        bids.push({
          productId: product._id,
          bidderId: shuffledBidders[i]._id,
          bidAmount,
          maxBidAmount,
          isAutoBid: hasMaxBid && i > 0 && Math.random() > 0.5,
          createdAt: bidTime,
        });

        currentPrice = bidAmount;
      }

      await Product.findByIdAndUpdate(product._id, {
        currentPrice,
      });

      totalBidsCreated += numBids;
    }

    await Bid.insertMany(bids);
    console.log(`Created ${totalBidsCreated} bids across ${products.length} products`);
    console.log(`Average ${(totalBidsCreated / products.length).toFixed(1)} bids per product`);

    return bids;
  } catch (error) {
    console.error('Error seeding bids:', error);
    throw error;
  }
};

