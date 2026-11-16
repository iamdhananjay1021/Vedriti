import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Puja } from '../models/Puja.js';
import { Product } from '../models/Product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PUJA_IMAGES = {
  'ganesh-puja': 'https://images.unsplash.com/photo-1567591414240-e145f8f53d71?auto=format&fit=crop&w=800&q=80',
  'griha-pravesh': 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
  'rudrabhishek': 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
  'satyanarayan': 'https://images.unsplash.com/photo-1604608678051-64d457f100eb?auto=format&fit=crop&w=800&q=80',
};

const PRODUCT_IMAGES = {
  'Sampurna Griha Pravesh Puja Kit': 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
  'Satyanarayan Katha Samagri Kit': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  'Daily Nitya Puja Kit': 'https://images.unsplash.com/photo-1604608678051-64d457f100eb?auto=format&fit=crop&w=800&q=80',
  '5-Mukhi Rudraksha Mala': 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=800&q=80',
  'Shri Mahalakshmi Yantra': 'https://images.unsplash.com/photo-1610056494052-6a4f83a8368c?auto=format&fit=crop&w=800&q=80',
};

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  for (const [slug, img] of Object.entries(PUJA_IMAGES)) {
    const res = await Puja.updateOne({ slug }, { $set: { imageUrl: img } });
    console.log(`Updated Puja ${slug}: ${res.modifiedCount} modified`);
  }

  for (const [name, img] of Object.entries(PRODUCT_IMAGES)) {
    const res = await Product.updateOne({ name: new RegExp(name, 'i') }, { $set: { imageUrl: img } });
    console.log(`Updated Product ${name}: ${res.modifiedCount} modified`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(console.error);
