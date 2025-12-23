import 'dotenv/config';
import nodemailer from 'nodemailer';

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
});

export async function sendOTPEmail(email, code, type) {
  const subject = type === 'email_verification' ? 'Email Verification Code' : 'Password Reset Code';

  const text =
    type === 'email_verification'
      ? `Your email verification code is: ${code}. This code will expire in 10 minutes.`
      : `Your password reset code is: ${code}. This code will expire in 10 minutes.`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: email,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendBidPlacedEmail(product, bid, topBid, currentUser) {
  try {
    const sellerEmail = product.sellerId.email;
    const bidderEmail = currentUser.email;
    const productUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/products/${product._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: sellerEmail,
      subject: `New Bid on Your Product: ${product.name}`,
      text: `A new bid has been placed on your product "${product.name}".\n\nBid Amount: $${bid.bidAmount}\nBidder: ${currentUser.name}\n\nView product: ${productUrl}`,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: bidderEmail,
      subject: `Bid Confirmation: ${product.name}`,
      text: `Your bid of $${bid.bidAmount} has been successfully placed on "${product.name}".\n\nView product: ${productUrl}`,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendBidderBlockedEmail(product, bidder) {
  try {
    const productUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/products/${product._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: bidder.email,
      subject: `Bidding Restriction: ${product.name}`,
      text: `You have been blocked from bidding on "${product.name}" by the seller.\n\nView product: ${productUrl}`,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendAuctionEndedNoWinnerEmail(product) {
  try {
    const sellerEmail = product.sellerId.email;
    const productUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/products/${product._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: sellerEmail,
      subject: `Auction Ended: ${product.name}`,
      text: `Your auction for "${product.name}" has ended without any bids.\n\nView product: ${productUrl}`,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendAuctionEndedWithWinnerEmail(product, winner) {
  try {
    const sellerEmail = product.sellerId.email;
    const winnerEmail = winner.email;
    const productUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/products/${product._id}`;
    const checkoutUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/checkout/${product._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: sellerEmail,
      subject: `Auction Won: ${product.name}`,
      text: `Your auction for "${product.name}" has ended.\n\nWinner: ${winner.name}\nWinning Bid: $${product.currentPrice}\n\nComplete the transaction: ${checkoutUrl}`,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: winnerEmail,
      subject: `Congratulations! You Won: ${product.name}`,
      text: `Congratulations! You won the auction for "${product.name}".\n\nWinning Bid: $${product.currentPrice}\n\nComplete your purchase: ${checkoutUrl}`,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendQuestionPostedEmail(product, question, asker) {
  try {
    const sellerEmail = product.sellerId.email;
    const productUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/products/${product._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: sellerEmail,
      subject: `New Question on Your Product: ${product.name}`,
      text: `A buyer has asked a question about your product "${product.name}".\n\nQuestion: ${question.question}\nAsked by: ${asker.name}\n\nAnswer the question: ${productUrl}`,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function sendQuestionAnsweredEmail(product, question, bids) {
  try {
    const productUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/products/${product._id}`;
    const bidderEmails = [...new Set(bids.map((bid) => bid.bidderId.email))];

    for (const email of bidderEmails) {
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@example.com',
        to: email,
        subject: `Question Answered: ${product.name}`,
        text: `A question about "${product.name}" has been answered by the seller.\n\nQuestion: ${question.question}\nAnswer: ${question.answer}\n\nView product: ${productUrl}`,
      });
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}
