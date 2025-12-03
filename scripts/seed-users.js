import 'dotenv/config';
import './../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const seedUsers = async () => {
  try {
    console.log('Starting user seed...');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const hashedPassword = bcrypt.hashSync('111111', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      address: '123 Admin Street, Hanoi',
    });

    const sellers = await User.insertMany([
      {
        name: 'John Smith',
        email: 'john@seller.com',
        password: hashedPassword,
        role: 'seller',
        isEmailVerified: true,
        address: '456 Seller Avenue, Ho Chi Minh City',
      },
      {
        name: 'Emily Johnson',
        email: 'emily@seller.com',
        password: hashedPassword,
        role: 'seller',
        isEmailVerified: true,
        address: '789 Market Street, Da Nang',
      },
      {
        name: 'Michael Brown',
        email: 'michael@seller.com',
        password: hashedPassword,
        role: 'seller',
        isEmailVerified: true,
        address: '321 Commerce Road, Hanoi',
      },
      {
        name: 'Sarah Davis',
        email: 'sarah@seller.com',
        password: hashedPassword,
        role: 'seller',
        isEmailVerified: true,
        address: '654 Business Blvd, Ho Chi Minh City',
      },
    ]);

    const bidders = await User.insertMany([
      {
        name: 'David Wilson',
        email: 'david@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '111 Bidder Lane, Hanoi',
      },
      {
        name: 'Jennifer Taylor',
        email: 'jennifer@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '222 Auction Street, Da Nang',
      },
      {
        name: 'Robert Anderson',
        email: 'robert@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '333 Buyer Avenue, Ho Chi Minh City',
      },
      {
        name: 'Mary Martinez',
        email: 'mary@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '444 Customer Road, Hanoi',
      },
      {
        name: 'James Garcia',
        email: 'james@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '555 Shopper Street, Da Nang',
      },
      {
        name: 'Patricia Rodriguez',
        email: 'patricia@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '666 Collector Avenue, Ho Chi Minh City',
      },
      {
        name: 'Christopher Lee',
        email: 'christopher@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '777 Enthusiast Lane, Hanoi',
      },
      {
        name: 'Linda Walker',
        email: 'linda@bidder.com',
        password: hashedPassword,
        role: 'bidder',
        isEmailVerified: true,
        address: '888 Buyer Circle, Da Nang',
      },
    ]);

    console.log(`Created: 1 admin, ${sellers.length} sellers, ${bidders.length} bidders`);
    
    return { admin, sellers, bidders };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

