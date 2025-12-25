import 'dotenv/config'
import mongoose from 'mongoose'
import './../utils/db.js'
import { seedCategories } from './seed-categories.js'
import { seedProducts } from './seed-products.js'
import { seedUsers } from './seed-users.js'

const seedAll = async () => {
  try {
    console.log('===========================================')
    console.log('Starting complete database seed...')
    console.log('===========================================\n')

    if (mongoose.connection.readyState === 0) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve)
      })
    }

    console.log('Connected to MongoDB\n')

    console.log('Clearing all collections...')
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()

    for (const collection of collections) {
      await db.collection(collection.name).drop()
      console.log(`   Dropped collection: ${collection.name}`)
    }
    console.log('✅ All collections cleared\n')

    await seedCategories()
    console.log('✅ Categories seeded\n')

    const { admin, sellers, bidders } = await seedUsers()
    console.log('✅ Users seeded\n')

    const products = await seedProducts(sellers)
    console.log('✅ Products seeded\n')

    console.log('===========================================')
    console.log('Database seed completed successfully!')
    console.log('===========================================\n')

    console.log('📊 Summary:')
    console.log(`   - 1 Admin account`)
    console.log(`   - 1 Seller account (user1)`)
    console.log(`   - 2 Regular User accounts (user2, user3)`)
    console.log(`   - ${products.length} Products (all by user1)`)
    console.log('\n💡 Login Credentials:')
    console.log('   Admin: admin@gmail.com / 123123')
    console.log('   Seller: user1@gmail.com / 123123')
    console.log('   User2: user2@gmail.com / 123123')
    console.log('   User3: user3@gmail.com / 123123')
    console.log('   (All accounts use password: 123123)\n')

    process.exit(0)
  } catch (error) {
    process.exit(1)
  }
}

seedAll()
