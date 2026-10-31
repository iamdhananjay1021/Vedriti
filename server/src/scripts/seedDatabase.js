import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { Puja } from '../models/Puja.js';
import { Product } from '../models/Product.js';
import { getSettings } from '../models/Settings.js';
import { SEED_PRODUCTS, SEED_PUJAS, SEED_SETTINGS } from './seedData.js';

const force = process.argv.includes('--force');

const upsertAll = async (Model, docs) => {
  let created = 0;
  let updated = 0;
  for (const doc of docs) {
    const existing = await Model.findOne({ slug: doc.slug });
    if (!existing) {
      await Model.create(doc);
      created += 1;
    } else if (force) {
      existing.set(doc);
      await existing.save();
      updated += 1;
    }
  }
  return { created, updated };
};

const run = async () => {
  await connectDatabase();
  const pujas = await upsertAll(Puja, SEED_PUJAS);
  const products = await upsertAll(Product, SEED_PRODUCTS);
  const settings = await getSettings();
  if (force || settings.panditName === 'Pandit Ji') {
    settings.set(SEED_SETTINGS);
    await settings.save();
  }
  console.log('[Seed] pujas', pujas, 'products', products);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('[Seed] failed', error);
  await mongoose.disconnect();
  process.exit(1);
});
