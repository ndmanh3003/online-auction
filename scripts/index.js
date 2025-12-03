import 'dotenv/config';
import mongoose from 'mongoose';
import './../utils/db.js';
import { seedCategories } from './seed-categories.js';
import { seedUsers } from './seed-users.js';
import { seedProducts } from './seed-products.js';
import { seedBids } from './seed-bids.js';
import { seedRatings } from './seed-ratings.js';
import { seedQuestions } from './seed-questions.js';

const seedAll = async () => {
  try {
    console.log('===========================================');
    console.log('Starting complete database seed...');
    console.log('===========================================\n');

    if (mongoose.connection.readyState === 0) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }

    console.log('Connected to MongoDB\n');

    await seedCategories();
    console.log('✅ Categories seeded\n');

    const { admin, sellers, bidders } = await seedUsers();
    console.log('✅ Users seeded\n');

    const products = await seedProducts(sellers);
    console.log('✅ Products seeded\n');

    await seedBids(products, bidders);
    console.log('✅ Bids seeded\n');

    await seedRatings(products, bidders, sellers);
    console.log('✅ Ratings seeded\n');

    await seedQuestions(products, bidders);
    console.log('✅ Questions seeded\n');

    console.log('===========================================');
    console.log('Database seed completed successfully!');
    console.log('===========================================\n');

    console.log('📊 Summary:');
    console.log(`   - 1 Admin account`);
    console.log(`   - ${sellers.length} Seller accounts`);
    console.log(`   - ${bidders.length} Bidder accounts`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - All products have 5+ bids`);
    console.log(`   - Sample ratings and questions added`);
    console.log('\n💡 Login Credentials:');
    console.log('   Admin: admin@auction.com / 123456');
    console.log('   Seller: john@seller.com / 123456');
    console.log('   Bidder: david@bidder.com / 123456');
    console.log('   (All accounts use password: 123456)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed process:', error);
    process.exit(1);
  }
};

seedAll();

