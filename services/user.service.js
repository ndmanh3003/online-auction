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

export async function findByGoogleId(googleId) {
  return await User.findOne({ googleId });
}

export async function createFromOAuth(profile, provider) {
  const userData = {
    name: profile.displayName || profile.name || 'User',
    email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${provider}_${profile.id}@oauth.local`,
    role: 'bidder',
    isEmailVerified: true,
  };

  if (provider === 'google') {
    userData.googleId = profile.id;
  }

  const newUser = new User(userData);
  return await newUser.save();
}
