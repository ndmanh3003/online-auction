import bcrypt from 'bcryptjs'
import 'dotenv/config'
import User from '../models/User.js'
import './../utils/db.js'

export const seedUsers = async () => {
  try {
    console.log('Starting user seed...')

    const hashedPassword = bcrypt.hashSync('123123', 10)

    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      address: '',
    })

    const user1 = await User.create({
      name: 'User1',
      email: 'user1@gmail.com',
      password: hashedPassword,
      role: null,
      isEmailVerified: true,
      address: '',
      sellerActivatedAt: now,
      sellerExpiresAt: sevenDaysLater,
    })

    const user2 = await User.create({
      name: 'User2',
      email: 'user2@gmail.com',
      password: hashedPassword,
      role: null,
      isEmailVerified: true,
      address: '',
    })

    const user3 = await User.create({
      name: 'User3',
      email: 'user3@gmail.com',
      password: hashedPassword,
      role: null,
      isEmailVerified: true,
      address: '',
    })

    console.log('Created: 1 admin, 1 seller (user1), 2 bidders (user2, user3)')

    return { admin, sellers: [user1], bidders: [user2, user3] }
  } catch (error) {
    console.error('Error seeding users:', error)
    throw error
  }
}
