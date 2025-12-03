import Product from '../models/Product.js';
import Bid from '../models/Bid.js';

export async function findById(id) {
  return await Product.findById(id)
    .populate('categoryId', 'name')
    .populate('sellerId', 'name email');
}

export async function findByIdWithDetails(id) {
  return await Product.findById(id)
    .populate('categoryId', 'name parentId')
    .populate('sellerId', 'name email');
}

export async function findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ status: 'active' });
  const items = await Product.find({ status: 'active' })
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
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

export async function findByCategory(categoryId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ categoryId, status: 'active' });
  const items = await Product.find({ categoryId, status: 'active' })
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
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

export async function findBySellerId(sellerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ sellerId, status: 'active' });
  const items = await Product.find({ sellerId, status: 'active' })
    .populate('categoryId', 'name')
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

export async function findEndedBySellerId(sellerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Product.countDocuments({ sellerId, status: 'ended' });
  const items = await Product.find({ sellerId, status: 'ended' })
    .populate('categoryId', 'name')
    .sort({ endTime: -1 })
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

export async function findAllAdmin(page = 1, limit = 10, status = null) {
  const skip = (page - 1) * limit;
  const query = status ? { status } : {};
  const total = await Product.countDocuments(query);
  const items = await Product.find(query)
    .populate('categoryId', 'name')
    .populate('sellerId', 'name email')
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

export async function getTopEndingSoon(limit = 5) {
  return await Product.find({ status: 'active', endTime: { $gt: new Date() } })
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
    .sort({ endTime: 1 })
    .limit(limit);
}

export async function getTopMostBids(limit = 5) {
  const products = await Product.find({ status: 'active' })
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
    .lean();

  const productsWithBidCount = await Promise.all(
    products.map(async (product) => {
      const bidCount = await Bid.countDocuments({ productId: product._id });
      return { ...product, bidCount };
    })
  );

  return productsWithBidCount.sort((a, b) => b.bidCount - a.bidCount).slice(0, limit);
}

export async function getTopHighestPrice(limit = 5) {
  return await Product.find({ status: 'active' })
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
    .sort({ currentPrice: -1 })
    .limit(limit);
}

export async function getRelatedProducts(categoryId, excludeId, limit = 5) {
  return await Product.find({
    categoryId,
    _id: { $ne: excludeId },
    status: 'active',
  })
    .populate('categoryId', 'name')
    .populate('sellerId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function create(productData) {
  const product = new Product({
    ...productData,
    currentPrice: productData.startPrice,
    endTime: new Date(Date.now() + productData.duration * 24 * 60 * 60 * 1000),
  });
  return await product.save();
}

export async function update(id, productData) {
  return await Product.findByIdAndUpdate(id, productData, { new: true });
}

export async function appendDescription(id, newDescription) {
  const product = await Product.findById(id);
  if (!product) return null;

  product.appendedDescriptions.push({
    content: newDescription,
    timestamp: new Date(),
  });

  return await product.save();
}

export async function updateCurrentPrice(id, newPrice) {
  return await Product.findByIdAndUpdate(id, { currentPrice: newPrice }, { new: true });
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

