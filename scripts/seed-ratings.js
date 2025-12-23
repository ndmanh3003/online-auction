import 'dotenv/config';
import './../utils/db.js';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';

export const seedRatings = async (products, bidders, sellers) => {
  try {
    console.log('Starting rating seed...');

    await Rating.deleteMany({});
    console.log('Cleared existing ratings');

    const ratings = [];
    const allUsers = [...bidders, ...sellers];

    for (const product of products.slice(0, 10)) {
      const numRatings = 2 + Math.floor(Math.random() * 3);
      const shuffledBidders = [...bidders].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(numRatings, shuffledBidders.length); i++) {
        const isPositive = Math.random() > 0.2;
        const comments = isPositive
          ? [
              'Great seller! Fast shipping and excellent product.',
              'Highly recommend this seller. Product as described.',
              'Smooth transaction. Would buy again!',
              'Excellent communication and quality item.',
              'Perfect! Exactly as shown in pictures.',
            ]
          : [
              'Item not as described.',
              'Slow shipping.',
              'Product had some issues.',
            ];

        ratings.push({
          productId: product._id,
          fromUserId: shuffledBidders[i]._id,
          toUserId: product.sellerId,
          rating: isPositive ? 1 : -1,
          comment: comments[Math.floor(Math.random() * comments.length)],
          type: 'bidder_to_seller',
        });
      }
    }

    for (const product of products.slice(0, 8)) {
      const numRatings = 1 + Math.floor(Math.random() * 2);
      const shuffledBidders = [...bidders].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(numRatings, shuffledBidders.length); i++) {
        const isPositive = Math.random() > 0.15;
        const comments = isPositive
          ? [
              'Excellent buyer! Quick payment.',
              'Great communication. Highly recommended!',
              'Smooth transaction. Thank you!',
              'Professional and prompt. A+ buyer.',
            ]
          : [
              'Buyer did not complete payment on time.',
              'Communication issues.',
            ];

        ratings.push({
          productId: product._id,
          fromUserId: product.sellerId,
          toUserId: shuffledBidders[i]._id,
          rating: isPositive ? 1 : -1,
          comment: comments[Math.floor(Math.random() * comments.length)],
          type: 'seller_to_bidder',
        });
      }
    }

    await Rating.insertMany(ratings);
    console.log(`Created ${ratings.length} ratings`);

    return ratings;
  } catch (error) {
    console.error('Error seeding ratings:', error);
    throw error;
  }
};

