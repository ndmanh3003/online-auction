import 'dotenv/config'
import Product from '../models/Product.js'
import { sendOutbidEmail } from '../utils/email.js'
import './../utils/db.js'

const sendOutbidEmailScript = async () => {
  try {
    const productName = 'iPhone 17'

    console.log(`Finding product: ${productName}...`)
    const product = await Product.findOne({ name: productName })
      .populate('sellerId')
      .populate('currentWinnerId')
      .populate('bids.bidderId')

    if (!product) {
      console.error(`❌ Product "${productName}" not found!`)
      process.exit(1)
    }

    console.log(`✅ Found product: ${product.name}`)
    console.log(
      `   Current Price: đ${product.currentPrice?.toLocaleString('vi-VN') || 0}`
    )
    console.log(`   Current Winner: ${product.currentWinnerId?.name || 'None'}`)
    console.log(`   Total Bids: ${product.bids.length}`)

    if (product.bids.length < 2) {
      console.error('❌ Need at least 2 bids to send outbid email!')
      process.exit(1)
    }

    // Sort bids by amount descending, then by createdAt ascending
    const sortedBids = [...product.bids].sort((a, b) => {
      if (b.bidAmount !== a.bidAmount) {
        return b.bidAmount - a.bidAmount
      }
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    const topBid = sortedBids[0]
    const previousBid = sortedBids[1]

    const previousBidder = previousBid.bidderId

    if (!previousBidder || !previousBidder.email) {
      console.error('❌ Previous bidder not found or missing email!')
      process.exit(1)
    }

    console.log(`\n📧 Sending outbid email to: ${previousBidder.email}`)
    console.log(`   Previous Bidder: ${previousBidder.name}`)
    console.log(
      `   New Bid Amount: đ${
        product.currentPrice?.toLocaleString('vi-VN') ||
        topBid.bidAmount.toLocaleString('vi-VN')
      }`
    )

    const newBidAmount = product.currentPrice || topBid.bidAmount

    await sendOutbidEmail(product, previousBidder, newBidAmount)

    console.log('\n✅ Outbid email sent successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error sending outbid email:')
    console.error(error)
    process.exit(1)
  }
}

sendOutbidEmailScript()
