import { Puja } from '../models/Puja.js';
import { AppError } from '../middlewares/errorHandler.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from '../services/inMemoryStore.js';

/**
 * GET /api/v1/pujas
 * Filter by deity, occasion, search query, kshetra
 */
export const getAllPujas = async (req, res, next) => {
  try {
    const { deity, occasion, search, kshetra, popular } = req.query;

    if (isDatabaseConnected()) {
      const filter = { isActive: true };

      if (deity && typeof deity === 'string' && deity !== 'all') {
        filter.deity = { $regex: new RegExp(deity, 'i') };
      }

      if (occasion && typeof occasion === 'string' && occasion !== 'all') {
        filter.occasionTags = { $in: [occasion.toLowerCase()] };
      }

      if (kshetra && typeof kshetra === 'string') {
        filter.kshetra = { $regex: new RegExp(kshetra, 'i') };
      }

      if (popular === 'true') {
        filter.isPopular = true;
      }

      if (search && typeof search === 'string') {
        const searchRegex = new RegExp(search.trim(), 'i');
        filter.$or = [
          { name: searchRegex },
          { sanskritName: searchRegex },
          { description: searchRegex },
          { deity: searchRegex },
        ];
      }

      const pujas = await Puja.find(filter).sort({ isPopular: -1, rating: -1 });

      res.status(200).json({
        success: true,
        count: pujas.length,
        data: pujas,
      });
    } else {
      // In-memory fallback
      let filtered = [...inMemoryStore.pujas];

      if (deity && typeof deity === 'string' && deity !== 'all') {
        filtered = filtered.filter((p) => p.deity.toLowerCase().includes(deity.toLowerCase()));
      }

      if (occasion && typeof occasion === 'string' && occasion !== 'all') {
        filtered = filtered.filter((p) => p.occasionTags.includes(occasion.toLowerCase()));
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sanskritName.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/pujas/:slug
 */
export const getPujaBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isDatabaseConnected()) {
      const puja = await Puja.findOne({ slug, isActive: true });
      if (!puja) {
        throw new AppError('अनुष्ठान विवरण नहीं मिला (Puja not found)', 404);
      }
      res.status(200).json({ success: true, data: puja });
    } else {
      const puja = inMemoryStore.pujas.find((p) => p.slug === slug);
      if (!puja) {
        throw new AppError('अनुष्ठान विवरण नहीं मिला (Puja not found)', 404);
      }
      res.status(200).json({ success: true, data: puja });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/pujas/popular
 */
export const getPopularPujas = async (req, res, next) => {
  try {
    if (isDatabaseConnected()) {
      const pujas = await Puja.find({ isActive: true, isPopular: true }).limit(6);
      res.status(200).json({ success: true, data: pujas });
    } else {
      const pujas = inMemoryStore.pujas.filter((p) => p.isPopular);
      res.status(200).json({ success: true, data: pujas });
    }
  } catch (error) {
    next(error);
  }
};
