import SellerRequest from '../models/SellerRequest.js';

export async function findByUserId(userId) {
  return await SellerRequest.findOne({ userId }).populate('userId', 'name email');
}

export async function create(userId) {
  const request = new SellerRequest({ userId });
  return await request.save();
}

export async function findAllPending(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const items = await SellerRequest.find({ status: 'pending' })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await SellerRequest.countDocuments({ status: 'pending' });
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

export async function findById(id) {
  return await SellerRequest.findById(id).populate('userId', 'name email role');
}

export async function updateStatus(id, status, reviewedBy) {
  return await SellerRequest.findByIdAndUpdate(
    id,
    { status, reviewedAt: new Date(), reviewedBy },
    { new: true }
  );
}
