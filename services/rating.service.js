import Rating from '../models/Rating.js';

export async function findByUserId(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Rating.countDocuments({ toUserId: userId });
  const items = await Rating.find({ toUserId: userId })
    .populate('fromUserId', 'name')
    .populate('productId', 'name')
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

export async function findByProduct(productId) {
  return await Rating.find({ productId })
    .populate('fromUserId', 'name')
    .populate('toUserId', 'name')
    .sort({ createdAt: -1 });
}

export async function findExisting(productId, fromUserId, toUserId) {
  return await Rating.findOne({ productId, fromUserId, toUserId });
}

export async function findByProductAndUsers(productId, fromUserId, toUserId) {
  return await findExisting(productId, fromUserId, toUserId);
}

export async function create(ratingData) {
  const rating = new Rating(ratingData);
  return await rating.save();
}

export async function createOrUpdate(productId, fromUserId, toUserId, ratingValue, comment, type) {
  const existing = await findExisting(productId, fromUserId, toUserId);

  if (existing) {
    existing.rating = ratingValue;
    existing.comment = comment;
    return await existing.save();
  }

  return await create({
    productId,
    fromUserId,
    toUserId,
    rating: ratingValue,
    comment,
    type,
  });
}

export async function calculateUserRating(userId) {
  const ratings = await Rating.find({ toUserId: userId });
  const total = ratings.length;
  if (total === 0) {
    return { positive: 0, negative: 0, total: 0, percent: 0 };
  }

  const positive = ratings.filter((r) => r.rating === 1).length;
  const negative = ratings.filter((r) => r.rating === -1).length;
  const percent = (positive / total) * 100;

  return { positive, negative, total, percent };
}

