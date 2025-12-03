import '../utils/db.js';
import * as configService from '../services/config.service.js';

async function seedConfigs() {
  try {
    console.log('Seeding system configs...');
    await configService.seed();
    console.log('System configs seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding configs:', error);
    process.exit(1);
  }
}

seedConfigs();

