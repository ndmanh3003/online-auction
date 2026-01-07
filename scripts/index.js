import 'dotenv/config'
import mongoose from 'mongoose'
import './../utils/db.js'
import { seedCategories } from './seed-categories.js'
import { seedProducts } from './seed-products.js'
import { seedRatings } from './seed-ratings.js'
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

    while (!mongoose.connection.db) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log('Connected to MongoDB\n')

    console.log('Clearing all collections...')
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()

    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop()
        console.log(`   Dropped collection: ${collection.name}`)
      } catch (error) {
        console.log(
          `   Skipped collection: ${collection.name} (${error.message})`
        )
      }
    }
    console.log('✅ All collections cleared\n')

    await seedCategories()
    console.log('✅ Categories seeded\n')

    const { sellers } = await seedUsers()
    console.log('✅ Users seeded\n')

    const products = await seedProducts(sellers)
    console.log('✅ Products seeded\n')

    await seedRatings()
    console.log('✅ Ratings seeded\n')

    console.log('===========================================')
    console.log('Database seed completed successfully!')
    console.log('===========================================\n')

    const activeProducts = products.filter((p) => p.status === 'active')
    const expiredProducts = products.filter((p) => p.status === 'ended')

    console.log('📊 Summary:')
    console.log(`   - 1 Admin account`)
    console.log(`   - 1 Seller account (user1)`)
    console.log(`   - 2 Regular User accounts (user2, user3)`)
    console.log(
      `   - ${products.length} Products (${activeProducts.length} active, ${expiredProducts.length} expired)`
    )
    console.log('\n💡 Login Credentials:')
    console.log('   Admin: admin@gmail.com / 123123')
    console.log('   Seller: user1@gmail.com / 123123')
    console.log('   User2: user2@gmail.com / 123123')
    console.log('   User3: user3@gmail.com / 123123')
    console.log('   (All accounts use password: 123123)\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error during seeding:')
    console.error(error)
    process.exit(1)
  }
}

seedAll()
