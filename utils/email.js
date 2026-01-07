import 'dotenv/config'
import nodemailer from 'nodemailer'

const EMAIL_MODE = process.env.EMAIL_MODE || 'log'
const SMTP_FROM = process.env.SMTP_FROM || 'Auction Web <noreply@auction.com>'

function formatCurrency(value) {
  if (!value && value !== 0) return '0'
  return new Intl.NumberFormat('vi-VN').format(value)
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
})

async function sendOrLog(mailOptions) {
  if (EMAIL_MODE === 'log') {
    console.log('\n========== EMAIL (TEST MODE) ==========')
    console.log('From:', mailOptions.from)
    console.log('To:', mailOptions.to)
    console.log('Subject:', mailOptions.subject)
    console.log('Content:', mailOptions.text || mailOptions.html)
    console.log('=======================================\n')
    return true
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

export async function sendOTPEmail(email, code, type) {
  const subject =
    type === 'email_verification'
      ? 'Email Verification Code'
      : 'Password Reset Code'

  const text =
    type === 'email_verification'
      ? `Your email verification code is: ${code}. This code will expire in 10 minutes.`
      : `Your password reset code is: ${code}. This code will expire in 10 minutes.`

  return await sendOrLog({
    from: SMTP_FROM,
    to: email,
    subject,
    text,
  })
}

export async function sendBidPlacedEmail(product, bid, topBid, currentUser) {
  const sellerEmail = product.sellerId.email
  const bidderEmail = currentUser.email
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`

  await sendOrLog({
    from: SMTP_FROM,
    to: sellerEmail,
    subject: `New Bid on Your Product: ${product.name}`,
    text: `A new bid has been placed on your product "${
      product.name
    }".\n\nBid Amount: đ${formatCurrency(bid.bidAmount)}\nBidder: ${
      currentUser.name
    }\n\nView product: ${productUrl}`,
  })

  await sendOrLog({
    from: SMTP_FROM,
    to: bidderEmail,
    subject: `Bid Confirmation: ${product.name}`,
    text: `Your bid of đ${formatCurrency(
      bid.bidAmount
    )} has been successfully placed on "${
      product.name
    }".\n\nView product: ${productUrl}`,
  })

  return true
}

export async function sendBidderBlockedEmail(product, bidder) {
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`

  return await sendOrLog({
    from: SMTP_FROM,
    to: bidder.email,
    subject: `Bidding Restriction: ${product.name}`,
    text: `You have been blocked from bidding on "${product.name}" by the seller.\n\nView product: ${productUrl}`,
  })
}

export async function sendOutbidEmail(product, previousBidder, newBidAmount) {
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`

  return await sendOrLog({
    from: SMTP_FROM,
    to: previousBidder.email,
    subject: `You've been outbid: ${product.name}`,
    text: `Someone has placed a higher bid on "${
      product.name
    }".\n\nNew bid: đ${formatCurrency(
      newBidAmount
    )}\nYou can place a new bid to stay in the competition.\n\nView product: ${productUrl}`,
  })
}

export async function sendAuctionEndedNoWinnerEmail(product) {
  const sellerEmail = product.sellerId.email
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`

  return await sendOrLog({
    from: SMTP_FROM,
    to: sellerEmail,
    subject: `Auction Ended: ${product.name}`,
    text: `Your auction for "${product.name}" has ended without any bids.\n\nView product: ${productUrl}`,
  })
}

export async function sendAuctionEndedWithWinnerEmail(product, winner) {
  const sellerEmail = product.sellerId.email
  const winnerEmail = winner.email
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`
  const checkoutUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/checkout/${product._id}`

  await sendOrLog({
    from: SMTP_FROM,
    to: sellerEmail,
    subject: `Auction Won: ${product.name}`,
    text: `Your auction for "${product.name}" has ended.\n\nWinner: ${
      winner.name
    }\nWinning Bid: đ${formatCurrency(
      product.currentPrice
    )}\n\nComplete the transaction: ${checkoutUrl}`,
  })

  await sendOrLog({
    from: SMTP_FROM,
    to: winnerEmail,
    subject: `Congratulations! You Won: ${product.name}`,
    text: `Congratulations! You won the auction for "${
      product.name
    }".\n\nWinning Bid: đ${formatCurrency(
      product.currentPrice
    )}\n\nComplete your purchase: ${checkoutUrl}`,
  })

  return true
}

export async function sendQuestionPostedEmail(product, question, asker) {
  const sellerEmail = product.sellerId.email
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`

  return await sendOrLog({
    from: SMTP_FROM,
    to: sellerEmail,
    subject: `New Question on Your Product: ${product.name}`,
    text: `A buyer has asked a question about your product "${product.name}".\n\nQuestion: ${question.question}\nAsked by: ${asker.name}\n\nAnswer the question: ${productUrl}`,
  })
}

export async function sendQuestionAnsweredEmail(question) {
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${question.productId._id}`

  return await sendOrLog({
    from: SMTP_FROM,
    to: question.askerId.email,
    subject: `Question Answered: ${question.productId.name}`,
    text: `A question about "${question.productId.name}" has been answered by the seller.\n\nQuestion: ${question.question}\nAnswer: ${question.answer}\n\nView product: ${productUrl}`,
  })
}

export async function sendDescriptionUpdatedEmail(product, currentWinner) {
  const productUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/products/${product._id}`

  return await sendOrLog({
    from: SMTP_FROM,
    to: currentWinner.email,
    subject: `Product Description Updated: ${product.name}`,
    text: `The seller has updated the description for "${product.name}" that you are currently winning.\n\nView updated product: ${productUrl}`,
  })
}

export async function sendPasswordResetNotificationEmail(
  email,
  name,
  newPassword
) {
  const loginUrl = `${
    process.env.BASE_URL || 'http://localhost:3000'
  }/auth/login`

  return await sendOrLog({
    from: SMTP_FROM,
    to: email,
    subject: 'Password Reset Notification',
    text: `Hello ${name},\n\nYour password has been reset by an administrator.\n\nYour new password is: ${newPassword}\n\nPlease login and change your password as soon as possible for security reasons.\n\nLogin: ${loginUrl}\n\nIf you did not request this password reset, please contact support immediately.`,
  })
}
