import Transaction from '../models/Transaction.js';

export async function findById(id) {
  return await Transaction.findById(id)
    .populate('productId', 'name currentPrice images')
    .populate('sellerId', 'name email')
    .populate('winnerId', 'name email');
}

export async function findByProductId(productId) {
  return await Transaction.findOne({ productId })
    .populate('productId', 'name currentPrice images')
    .populate('sellerId', 'name email')
    .populate('winnerId', 'name email');
}

export async function findBySellerId(sellerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Transaction.countDocuments({ sellerId });
  const items = await Transaction.find({ sellerId })
    .populate('productId', 'name currentPrice')
    .populate('winnerId', 'name email')
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

export async function findByWinnerId(winnerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await Transaction.countDocuments({ winnerId });
  const items = await Transaction.find({ winnerId })
    .populate('productId', 'name currentPrice')
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

export async function create(transactionData) {
  const transaction = new Transaction(transactionData);
  return await transaction.save();
}

export async function updateStatus(id, status) {
  return await Transaction.findByIdAndUpdate(id, { status }, { new: true });
}

export async function submitPayment(id, paymentProof, shippingAddress) {
  return await Transaction.findByIdAndUpdate(
    id,
    {
      paymentProof,
      'shippingInfo.address': shippingAddress,
      status: 'payment_confirmed',
    },
    { new: true }
  );
}

export async function confirmPayment(id, trackingNumber, carrier) {
  return await Transaction.findByIdAndUpdate(
    id,
    {
      'shippingInfo.trackingNumber': trackingNumber,
      'shippingInfo.carrier': carrier,
      status: 'shipped',
    },
    { new: true }
  );
}

export async function confirmDelivery(id) {
  return await Transaction.findByIdAndUpdate(
    id,
    {
      deliveryConfirmedAt: new Date(),
      status: 'delivered',
    },
    { new: true }
  );
}

export async function addChatMessage(id, senderId, message) {
  return await Transaction.findByIdAndUpdate(
    id,
    {
      $push: {
        chat: {
          senderId,
          message,
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  );
}

export async function updateRatingStatus(id, isSellerRating) {
  const update = isSellerRating
    ? { 'ratings.sellerRated': true }
    : { 'ratings.bidderRated': true };

  return await Transaction.findByIdAndUpdate(id, update, { new: true });
}

export async function cancel(id) {
  return await Transaction.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
}

