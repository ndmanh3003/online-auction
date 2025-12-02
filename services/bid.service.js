import Bid from '../models/Bid.js';
import Product from '../models/Product.js';
import * as ratingService from './rating.service.js';
import * as productService from './product.service.js';

export async function findById(id) {
  return await Bid.findById(id).populate('bidderId', 'name email').populate('productId', 'name');
}

export async function findByProductId(productId) {
  return await Bid.find({ productId })
    .populate('bidderId', 'name')
    .sort({ bidAmount: -1, createdAt: 1 });
}

export async function findByBidderId(bidderId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Bid.countDocuments({ bidderId });
  const items = await Bid.find({ bidderId })
    .populate('productId', 'name currentPrice endTime status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findActiveBidsByUser(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const bids = await Bid.find({ bidderId: userId })
    .populate({
      path: 'productId',
      match: { status: 'active' },
      populate: { path: 'categoryId', select: 'name' },
    })
    .sort({ createdAt: -1 });

  const filteredBids = bids.filter((bid) => bid.productId !== null);
  const total = filteredBids.length;
  const items = filteredBids.slice(skip, skip + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findWonByUser(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const endedProducts = await Product.find({ status: 'ended' }).select('_id');
  const productIds = endedProducts.map((p) => p._id);

  const allBids = await Bid.find({ productId: { $in: productIds } })
    .populate({
      path: 'productId',
      populate: { path: 'categoryId', select: 'name' },
    })
    .sort({ bidAmount: -1, createdAt: 1 });

  const wonProducts = [];
  const seenProducts = new Set();

  for (const bid of allBids) {
    if (bid.productId && !seenProducts.has(bid.productId._id.toString())) {
      seenProducts.add(bid.productId._id.toString());
      if (bid.bidderId.toString() === userId.toString()) {
        wonProducts.push(bid);
      }
    }
  }

  const total = wonProducts.length;
  const items = wonProducts.slice(skip, skip + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTopBidder(productId) {
  const topBid = await Bid.findOne({ productId })
    .populate('bidderId', 'name email')
    .sort({ bidAmount: -1, createdAt: 1 });
  return topBid;
}

export async function getSecondHighestBid(productId) {
  const bids = await Bid.find({ productId }).sort({ bidAmount: -1, createdAt: 1 }).limit(2);
  return bids.length > 1 ? bids[1] : null;
}

export async function create(bidData) {
  const bid = new Bid(bidData);
  return await bid.save();
}

export async function placeBid(productId, bidderId, bidAmount, maxBidAmount = null) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  if (product.status !== 'active') {
    throw new Error('Auction has ended');
  }

  if (new Date() > product.endTime) {
    throw new Error('Auction has ended');
  }

  if (product.sellerId.toString() === bidderId.toString()) {
    throw new Error('Seller cannot bid on their own product');
  }

  if (product.blockedBidders.includes(bidderId)) {
    throw new Error('You are blocked from bidding on this product');
  }

  const minBidAmount = product.currentPrice + product.stepPrice;
  if (bidAmount < minBidAmount) {
    throw new Error(`Minimum bid is ${minBidAmount}`);
  }

  const topBid = await getTopBidder(productId);

  let finalBidAmount = bidAmount;
  let isAutoBid = false;

  if (topBid && topBid.maxBidAmount) {
    if (maxBidAmount && maxBidAmount > topBid.maxBidAmount) {
      finalBidAmount = Math.min(topBid.maxBidAmount + product.stepPrice, maxBidAmount);
      isAutoBid = true;
    } else if (bidAmount <= topBid.maxBidAmount) {
      const autoBidAmount = Math.min(bidAmount + product.stepPrice, topBid.maxBidAmount);
      await create({
        productId,
        bidderId: topBid.bidderId._id,
        bidAmount: autoBidAmount,
        maxBidAmount: topBid.maxBidAmount,
        isAutoBid: true,
      });
      await productService.updateCurrentPrice(productId, autoBidAmount);
      return { success: false, message: 'Outbid by auto-bid system', currentBid: autoBidAmount };
    }
  }

  const bid = await create({
    productId,
    bidderId,
    bidAmount: finalBidAmount,
    maxBidAmount,
    isAutoBid,
  });

  await productService.updateCurrentPrice(productId, finalBidAmount);

  if (product.autoExtend) {
    const thresholdMinutes = parseInt(process.env.AUTO_EXTEND_THRESHOLD_MINUTES || '5');
    const extendMinutes = parseInt(process.env.AUTO_EXTEND_DURATION_MINUTES || '10');
    const thresholdTime = new Date(product.endTime.getTime() - thresholdMinutes * 60 * 1000);

    if (new Date() >= thresholdTime) {
      const newEndTime = new Date(product.endTime.getTime() + extendMinutes * 60 * 1000);
      await productService.updateEndTime(productId, newEndTime);
    }
  }

  return { success: true, bid };
}

export async function validateBidder(bidderId, product) {
  const rating = await ratingService.calculateUserRating(bidderId);

  if (rating.total === 0 && !product.allowNonRatedBidders) {
    return {
      valid: false,
      message: 'Seller does not allow bidders without ratings',
    };
  }

  const minRatingPercent = parseInt(process.env.MIN_BIDDER_RATING_PERCENT || '80');
  if (rating.total > 0 && rating.percent < minRatingPercent) {
    return {
      valid: false,
      message: `You need at least ${minRatingPercent}% positive rating to bid`,
    };
  }

  return { valid: true };
}

export async function blockBidder(productId, bidderId) {
  await productService.addBlockedBidder(productId, bidderId);

  const topBid = await getTopBidder(productId);
  if (topBid && topBid.bidderId._id.toString() === bidderId.toString()) {
    const secondBid = await getSecondHighestBid(productId);
    if (secondBid) {
      await productService.updateCurrentPrice(productId, secondBid.bidAmount);
    }
  }
}

export async function countByProductId(productId) {
  return await Bid.countDocuments({ productId });
}

export async function countByBidderId(bidderId) {
  return await Bid.countDocuments({ bidderId });
}

