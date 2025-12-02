import 'dotenv/config';
import './../utils/db.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

const seedCategories = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }

    console.log('Starting category seed...');

    await Category.deleteMany({});
    console.log('Cleared existing categories');

    const collectibles = await Category.create({
      name: 'Collectibles',
      img_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      description: 'Rare collectibles, antiques, and vintage items',
    });

    const art = await Category.create({
      name: 'Art & Antiques',
      img_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      description: 'Paintings, sculptures, and antique artworks',
    });

    const luxury = await Category.create({
      name: 'Luxury Items',
      img_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      description: 'High-end luxury goods and premium items',
    });

    await Category.create({
      name: 'Coins & Currency',
      img_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      description: 'Rare coins, banknotes, and currency collections',
      parentId: collectibles._id,
    });

    await Category.create({
      name: 'Stamps',
      img_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
      description: 'Vintage stamps and philatelic items',
      parentId: collectibles._id,
    });

    await Category.create({
      name: 'Vintage Toys',
      img_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      description: 'Collectible vintage toys and memorabilia',
      parentId: collectibles._id,
    });

    await Category.create({
      name: 'Paintings',
      img_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      description: 'Original paintings and artworks',
      parentId: art._id,
    });

    await Category.create({
      name: 'Sculptures',
      img_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
      description: 'Sculptures and three-dimensional artworks',
      parentId: art._id,
    });

    await Category.create({
      name: 'Antique Furniture',
      img_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      description: 'Antique and vintage furniture pieces',
      parentId: art._id,
    });

    await Category.create({
      name: 'Luxury Watches',
      img_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      description: 'High-end luxury timepieces and watches',
      parentId: luxury._id,
    });

    await Category.create({
      name: 'Jewelry',
      img_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      description: 'Fine jewelry, diamonds, and precious stones',
      parentId: luxury._id,
    });

    await Category.create({
      name: 'Luxury Handbags',
      img_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      description: 'Designer handbags and luxury accessories',
      parentId: luxury._id,
    });

    console.log(`Total categories created: ${await Category.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
