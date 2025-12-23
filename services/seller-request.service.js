import SellerRequest from '../models/SellerRequest.js';

export async function findByUserId(userId) {
  return await SellerRequest.findOne({ userId }).populate('userId', 'name email');
}

export async function create(userId) {
  const request = new SellerRequest({ userId });
  return await request.save();
}


export async function findAll(page = 1, limit = 10, status = null) {
  const skip = (page - 1) * limit;
  const filter = status ? { status } : {};
  const items = await SellerRequest.find(filter)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await SellerRequest.countDocuments(filter);
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
