import dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { UserSchema } from '../entities/User.js';
import { OTPSchema } from '../entities/OTP.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'bid',
  synchronize: true,
  logging: false,
  entities: [UserSchema, OTPSchema],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function initDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('📦 Database connected!');
  }
}
