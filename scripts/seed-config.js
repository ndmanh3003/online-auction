import '../utils/db.js'
import AuctionConfig from '../models/AuctionConfig.js'

async function seedConfig() {
  try {
    await AuctionConfig.deleteMany({})

    const config = await AuctionConfig.create({
      autoExtendThresholdMinutes: 5,
      autoExtendDurationMinutes: 10,
      sellerDurationDays: 7,
      newProductHighlightMinutes: 30,
      minRatingPercentForBid: 80,
    })

    console.log('✅ Auction configuration seeded successfully')
    console.log('Configuration:', config)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding auction configuration:', error)
    process.exit(1)
  }
}

seedConfig()

