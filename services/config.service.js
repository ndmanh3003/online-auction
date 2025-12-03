import SystemConfig from '../models/SystemConfig.js';

export async function findAll() {
  return await SystemConfig.find().sort({ key: 1 });
}

export async function findByKey(key) {
  return await SystemConfig.findOne({ key });
}

export async function getValue(key, defaultValue = null) {
  const config = await findByKey(key);
  if (!config) return defaultValue;

  switch (config.type) {
    case 'number':
      return parseInt(config.value);
    case 'boolean':
      return config.value === 'true';
    default:
      return config.value;
  }
}

export async function update(key, value) {
  return await SystemConfig.findOneAndUpdate({ key }, { value }, { new: true });
}

export async function create(configData) {
  const config = new SystemConfig(configData);
  return await config.save();
}

export async function seed() {
  const configs = [
    {
      key: 'AUTO_EXTEND_THRESHOLD_MINUTES',
      value: '5',
      description: 'Minutes before auction end to trigger auto-extend',
      type: 'number',
    },
    {
      key: 'AUTO_EXTEND_DURATION_MINUTES',
      value: '10',
      description: 'Minutes to extend auction when auto-extend is triggered',
      type: 'number',
    },
    {
      key: 'MIN_BIDDER_RATING_PERCENT',
      value: '80',
      description: 'Minimum rating percentage required for bidders to participate',
      type: 'number',
    },
    {
      key: 'NEW_PRODUCT_HIGHLIGHT_MINUTES',
      value: '10',
      description: 'Minutes to highlight new products in search results',
      type: 'number',
    },
  ];

  for (const config of configs) {
    const existing = await findByKey(config.key);
    if (!existing) {
      await create(config);
    }
  }

  console.log('System configs seeded successfully');
}

