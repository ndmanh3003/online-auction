import Watchlist from '../models/Watchlist.js';

export async function findByUserId(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Watchlist.countDocuments({ userId });
  const items = await Watchlist.find({ userId })
    .populate({
      path: 'productId',
      populate: { path: 'categoryId', select: 'name' },
    })
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

export async function findByUserAndProduct(userId, productId) {
  return await Watchlist.findOne({ userId, productId });
}

export async function add(userId, productId) {
  const existing = await findByUserAndProduct(userId, productId);
  if (existing) {
    return existing;
  }
  const watchlist = new Watchlist({ userId, productId });
  return await watchlist.save();
}

export async function remove(userId, productId) {
  return await Watchlist.findOneAndDelete({ userId, productId });
}

export async function isInWatchlist(userId, productId) {
  const item = await findByUserAndProduct(userId, productId);
  return item !== null;
}

