import { z } from 'zod';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../middlewares/errorHandler.js';
import { nowInIst, addDays } from '../utils/time.js';

export const NityaPujaSchema = z.object({
  deity: z.string().trim().optional(),
  offering: z.enum(['DIYA', 'BELL', 'FLOWERS', 'DHOOP', 'SHANKH', 'ALL']).default('DIYA'),
});

export const JapaSchema = z.object({
  count: z.number().int().min(1).max(10080),
  mantraId: z.string().trim().optional(),
  mantraName: z.string().trim().optional(),
});

export const recordNityaPuja = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('Devotee account not found', 404);

  const today = nowInIst().date;
  const yesterday = addDays(today, -1);

  let streak = user.dailyPujaStreak || 0;
  const lastDate = user.lastPujaDate || '';
  const alreadyCompletedToday = lastDate === today;

  if (!alreadyCompletedToday) {
    if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    user.dailyPujaStreak = streak;
    user.lastPujaDate = today;
  }

  user.totalDiyaLit = (user.totalDiyaLit || 0) + 1;
  if (req.body.deity) {
    user.favoriteDeity = req.body.deity;
  }

  await user.save();

  res.json({
    success: true,
    data: {
      streak: user.dailyPujaStreak,
      totalDiyaLit: user.totalDiyaLit,
      lastPujaDate: user.lastPujaDate,
      alreadyCompletedToday,
      favoriteDeity: user.favoriteDeity,
      message: alreadyCompletedToday
        ? 'दीप प्रज्ज्वलन संपन्न हुआ!'
        : `अद्भुत! आपका ${user.dailyPujaStreak}-दिवसीय अखंड नित्य पूजन संकल्प जारी है।`,
    },
  });
});

export const recordJapa = asyncHandler(async (req, res) => {
  const { count } = req.body;
  const user = await User.findById(req.userId);
  if (!user) throw new AppError('Devotee account not found', 404);

  user.totalJapaCount = (user.totalJapaCount || 0) + count;
  user.totalMalasCompleted = Math.floor(user.totalJapaCount / 108);

  await user.save();

  res.json({
    success: true,
    data: {
      totalJapaCount: user.totalJapaCount,
      totalMalasCompleted: user.totalMalasCompleted,
      addedCount: count,
      message: `पुण्य फल! ${count} मंत्र जप सफलता पूर्वक प्रभु चरणों में समर्पित किए गए।`,
    },
  });
});

