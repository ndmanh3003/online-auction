import User from '../models/User.js';

export async function findByEmail(email) {
  return await User.findOne({ email: email.toLowerCase().trim() });
}

export async function findById(id) {
  return await User.findById(id);
}

export async function add(user) {
  const newUser = new User(user);
  return await newUser.save();
}

export async function update(id, user) {
  return await User.findByIdAndUpdate(id, user, { new: true });
}

export async function updatePassword(id, hashedPassword) {
  return await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
}

export async function verifyEmail(id) {
  return await User.findByIdAndUpdate(id, { isEmailVerified: true }, { new: true });
}

export async function updateRole(id, role) {
  return await User.findByIdAndUpdate(id, { role }, { new: true });
}

export async function findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const total = await User.countDocuments();
  const items = await User.find()
    .select('-password')
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

export async function remove(id) {
  return await User.findByIdAndDelete(id);
}
