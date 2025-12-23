import Product from '../models/Product.js';
import Bid from '../models/Bid.js';
import * as bidService from './bid.service.js';
import * as questionService from './question.service.js';

export async function findById(id, includeRelated = true) {
  const product = await Product.findById(id).populate('categoryId').populate('sellerId');
  const currentPrice = await bidService.getCurrentPrice(id);
  const bidCount = await bidService.countByProductId(id);
  const topBid = await bidService.getTopBidder(id);
  const result = { 
    ...product.toObject(), 
    currentPrice,
    bidCount,
    topBidder: topBid ? topBid.bidderId : null,
  };
  if (includeRelated) {
    result.questions = await questionService.findByProductId(id);
    result.relatedProducts = await getRelatedProducts(product.categoryId._id, id, 5);
  }
  return result;
}

export async function findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ status: 'active' });
  const items = await Product.find({ status: 'active' })
    .populate('categoryId')
    .populate('sellerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const currentPrice = await bidService.getCurrentPrice(item._id);
      const bidCount = await bidService.countByProductId(item._id);
      const topBid = await bidService.getTopBidder(item._id);
      return { ...item.toObject(), currentPrice, bidCount, topBidder: topBid ? topBid.bidderId : null };
    })
  );
  return {
    items: enrichedItems,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function findByCategory(categoryId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ categoryId, status: 'active' });
  const items = await Product.find({ categoryId, status: 'active' })
    .populate('categoryId')
    .populate('sellerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const currentPrice = await bidService.getCurrentPrice(item._id);
      const bidCount = await bidService.countByProductId(item._id);
      const topBid = await bidService.getTopBidder(item._id);
      return { ...item.toObject(), currentPrice, bidCount, topBidder: topBid ? topBid.bidderId : null };
    })
  );
  return {
    items: enrichedItems,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function findBySellerId(sellerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ sellerId, status: 'active' });
  const items = await Product.find({ sellerId, status: 'active' })
    .populate('categoryId')
    .populate('sellerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const currentPrice = await bidService.getCurrentPrice(item._id);
      const bidCount = await bidService.countByProductId(item._id);
      const topBid = await bidService.getTopBidder(item._id);
      return { ...item.toObject(), currentPrice, bidCount, topBidder: topBid ? topBid.bidderId : null };
    })
  );
  return {
    items: enrichedItems,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function findEndedBySellerId(sellerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ sellerId, status: 'ended' });
  const items = await Product.find({ sellerId, status: 'ended' })
    .populate('categoryId')
    .populate('sellerId')
    .sort({ endTime: -1 })
    .skip(skip)
    .limit(limit);
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const currentPrice = await bidService.getCurrentPrice(item._id);
      const bidCount = await bidService.countByProductId(item._id);
      const topBid = await bidService.getTopBidder(item._id);
      return { ...item.toObject(), currentPrice, bidCount, topBidder: topBid ? topBid.bidderId : null };
    })
  );
  return {
    items: enrichedItems,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function findAllAdmin(page = 1, limit = 10, status = null) {
  const skip = (page - 1) * limit;
  const query = status ? { status } : {};
  const total = await Product.countDocuments(query);
  const items = await Product.find(query)
    .populate('categoryId')
    .populate('sellerId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const currentPrice = await bidService.getCurrentPrice(item._id);
      const bidCount = await bidService.countByProductId(item._id);
      const topBid = await bidService.getTopBidder(item._id);
      return { ...item.toObject(), currentPrice, bidCount, topBidder: topBid ? topBid.bidderId : null };
    })
  );
  return {
    items: enrichedItems,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTopEndingSoon(limit = 5) {
  const items = await Product.find({ status: 'active', endTime: { $gt: new Date() } })
    .populate('categoryId')
    .populate('sellerId')
    .sort({ endTime: 1 })
    .limit(limit);
  return await Promise.all(items.map(async (item) => {
    const currentPrice = await bidService.getCurrentPrice(item._id);
    return { ...item.toObject(), currentPrice };
  }));
}

export async function getTopMostBids(limit = 5) {
  const products = await Product.find({ status: 'active' }).populate('categoryId').populate('sellerId').lean();
  const productsWithBidCount = await Promise.all(products.map(async (product) => {
    const bidCount = await Bid.countDocuments({ productId: product._id });
    const currentPrice = await bidService.getCurrentPrice(product._id);
    return { ...product, bidCount, currentPrice };
  }));
  return productsWithBidCount.sort((a, b) => b.bidCount - a.bidCount).slice(0, limit);
}

export async function getTopHighestPrice(limit = 5) {
  const products = await Product.find({ status: 'active' }).populate('categoryId').populate('sellerId').lean();
  const productsWithPrice = await Promise.all(products.map(async (product) => {
    const currentPrice = await bidService.getCurrentPrice(product._id);
    return { ...product, currentPrice };
  }));
  return productsWithPrice.sort((a, b) => b.currentPrice - a.currentPrice).slice(0, limit);
}

export async function getRelatedProducts(categoryId, excludeId, limit = 5) {
  const items = await Product.find({ categoryId, _id: { $ne: excludeId }, status: 'active' })
    .populate('categoryId')
    .populate('sellerId')
    .sort({ createdAt: -1 })
    .limit(limit);
  return await Promise.all(items.map(async (item) => {
    const currentPrice = await bidService.getCurrentPrice(item._id);
    return { ...item.toObject(), currentPrice };
  }));
}

export async function create(productData) {
  const product = new Product(productData);
  return await product.save();
}

export async function update(id, productData) {
  return await Product.findByIdAndUpdate(id, productData, { new: true });
}

export async function appendDescription(id, newDescription) {
  const product = await Product.findById(id);
  product.appendedDescriptions.push({ content: newDescription, timestamp: new Date() });
  return await product.save();
}

export async function updateEndTime(id, newEndTime) {
  return await Product.findByIdAndUpdate(id, { endTime: newEndTime }, { new: true });
}

export async function updateStatus(id, status) {
  return await Product.findByIdAndUpdate(id, { status }, { new: true });
}

export async function addBlockedBidder(productId, bidderId) {
  return await Product.findByIdAndUpdate(
    productId,
    { $addToSet: { blockedBidders: bidderId } },
    { new: true }
  );
}

export async function remove(id) {
  return await Product.findByIdAndDelete(id);
}

export async function countByCategory(categoryId) {
  return await Product.countDocuments({ categoryId });
}

export async function countBySellerId(sellerId) {
  return await Product.countDocuments({ sellerId, status: 'active' });
}

