import Product from '../models/Product.js'
import Rating from '../models/Rating.js'
import User from '../models/User.js'

export const seedRatings = async () => {
  try {
    console.log('Starting ratings seed...')

    const user1 = await User.findOne({ email: 'user1@gmail.com' })
    const user2 = await User.findOne({ email: 'user2@gmail.com' })
    const user3 = await User.findOne({ email: 'user3@gmail.com' })
    const user4 = await User.findOne({ email: 'user4@gmail.com' })
    const user5 = await User.findOne({ email: 'user5@gmail.com' })

    if (!user1 || !user2 || !user3 || !user4 || !user5) {
      throw new Error('Users not found. Please run seed-users first.')
    }

    const products = await Product.find().limit(20)
    if (products.length === 0) {
      throw new Error('Products not found. Please run seed-products first.')
    }

    const ratings = []

    // User 1: 80% rating (4 positive, 1 negative = 4/5 = 80%)
    const user1Ratings = [
      {
        productId: products[0]._id,
        fromUserId: user2._id,
        toUserId: user1._id,
        rating: 1,
        comment: 'Great seller, fast shipping!',
        type: 'bidder_to_seller',
      },
      {
        productId: products[1]._id,
        fromUserId: user3._id,
        toUserId: user1._id,
        rating: 1,
        comment: 'Excellent product quality',
        type: 'bidder_to_seller',
      },
      {
        productId: products[2]._id,
        fromUserId: user2._id,
        toUserId: user1._id,
        rating: 1,
        comment: 'Very responsive and professional',
        type: 'bidder_to_seller',
      },
      {
        productId: products[3]._id,
        fromUserId: user3._id,
        toUserId: user1._id,
        rating: 1,
        comment: 'Perfect transaction',
        type: 'bidder_to_seller',
      },
      {
        productId: products[4]._id,
        fromUserId: user2._id,
        toUserId: user1._id,
        rating: -1,
        comment: 'Product arrived late',
        type: 'bidder_to_seller',
      },
    ]

    // User 2: 100% rating (5 positive, 0 negative = 5/5 = 100%)
    const user2Ratings = [
      {
        productId: products[5]._id,
        fromUserId: user1._id,
        toUserId: user2._id,
        rating: 1,
        comment: 'Good bidder, paid on time',
        type: 'seller_to_bidder',
      },
      {
        productId: products[6]._id,
        fromUserId: user3._id,
        toUserId: user2._id,
        rating: 1,
        comment: 'Reliable buyer',
        type: 'seller_to_bidder',
      },
      {
        productId: products[7]._id,
        fromUserId: user1._id,
        toUserId: user2._id,
        rating: 1,
        comment: 'Smooth transaction',
        type: 'seller_to_bidder',
      },
      {
        productId: products[8]._id,
        fromUserId: user3._id,
        toUserId: user2._id,
        rating: 1,
        comment: 'Excellent communication',
        type: 'seller_to_bidder',
      },
      {
        productId: products[9]._id,
        fromUserId: user1._id,
        toUserId: user2._id,
        rating: 1,
        comment: 'Highly recommended',
        type: 'seller_to_bidder',
      },
    ]

    // User 3: 100% rating (5 positive, 0 negative = 5/5 = 100%)
    const user3Ratings = [
      {
        productId: products[10]._id,
        fromUserId: user1._id,
        toUserId: user3._id,
        rating: 1,
        comment: 'Great seller',
        type: 'bidder_to_seller',
      },
      {
        productId: products[11]._id,
        fromUserId: user2._id,
        toUserId: user3._id,
        rating: 1,
        comment: 'Fast delivery',
        type: 'bidder_to_seller',
      },
      {
        productId: products[12]._id,
        fromUserId: user1._id,
        toUserId: user3._id,
        rating: 1,
        comment: 'Product as described',
        type: 'bidder_to_seller',
      },
      {
        productId: products[13]._id,
        fromUserId: user2._id,
        toUserId: user3._id,
        rating: 1,
        comment: 'Professional service',
        type: 'bidder_to_seller',
      },
      {
        productId: products[14]._id,
        fromUserId: user1._id,
        toUserId: user3._id,
        rating: 1,
        comment: 'Very satisfied',
        type: 'bidder_to_seller',
      },
    ]

    // User 4: 50% rating (1 positive, 1 negative = 1/2 = 50%)
    const user4Ratings = [
      {
        productId: products[15]._id,
        fromUserId: user1._id,
        toUserId: user4._id,
        rating: 1,
        comment: 'Good transaction',
        type: 'seller_to_bidder',
      },
      {
        productId: products[16]._id,
        fromUserId: user2._id,
        toUserId: user4._id,
        rating: -1,
        comment: 'Payment delayed',
        type: 'seller_to_bidder',
      },
    ]

    // User 5: No ratings (0 ratings)

    for (const ratingData of user1Ratings) {
      const rating = await Rating.create(ratingData)
      ratings.push(rating)
    }

    for (const ratingData of user2Ratings) {
      const rating = await Rating.create(ratingData)
      ratings.push(rating)
    }

    for (const ratingData of user3Ratings) {
      const rating = await Rating.create(ratingData)
      ratings.push(rating)
    }

    for (const ratingData of user4Ratings) {
      const rating = await Rating.create(ratingData)
      ratings.push(rating)
    }

    console.log(`Created ${ratings.length} ratings`)
    console.log(
      `   - ${user1Ratings.length} ratings for user1 (80% - ${
        user1Ratings.filter((r) => r.rating === 1).length
      } positive, ${
        user1Ratings.filter((r) => r.rating === -1).length
      } negative)`
    )
    console.log(
      `   - ${user2Ratings.length} ratings for user2 (100% - ${
        user2Ratings.filter((r) => r.rating === 1).length
      } positive, ${
        user2Ratings.filter((r) => r.rating === -1).length
      } negative)`
    )
    console.log(
      `   - ${user3Ratings.length} ratings for user3 (100% - ${
        user3Ratings.filter((r) => r.rating === 1).length
      } positive, ${
        user3Ratings.filter((r) => r.rating === -1).length
      } negative)`
    )
    console.log(
      `   - ${user4Ratings.length} ratings for user4 (50% - ${
        user4Ratings.filter((r) => r.rating === 1).length
      } positive, ${
        user4Ratings.filter((r) => r.rating === -1).length
      } negative)`
    )
    console.log('   - 0 ratings for user5 (no ratings)')

    return ratings
  } catch (error) {
    console.error('Error seeding ratings:', error)
    throw error
  }
}
