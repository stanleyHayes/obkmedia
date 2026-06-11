import { Router } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Portfolio } from '../models/Portfolio.js';
import { Category } from '../models/Category.js';

export const adminStatsRouter = Router();

/**
 * Dashboard stats. Each figure is only computed and returned when the caller's
 * role grants the matching view permission, and recent messages (which contain
 * inquiry PII) are included only for users with messages.view.
 */
adminStatsRouter.get('/', async (req: AuthedRequest, res) => {
  const perms = req.adminPermissions ?? [];
  const canPortfolio = perms.includes('portfolio.view');
  const canCategories = perms.includes('categories.view');
  const canMessages = perms.includes('messages.view');

  const [portfolios, published, featured, categories, messages, unread, recentMessages] =
    await Promise.all([
      canPortfolio ? Portfolio.countDocuments() : Promise.resolve(0),
      canPortfolio ? Portfolio.countDocuments({ isPublished: true }) : Promise.resolve(0),
      canPortfolio ? Portfolio.countDocuments({ isFeatured: true, isPublished: true }) : Promise.resolve(0),
      canCategories ? Category.countDocuments() : Promise.resolve(0),
      canMessages ? ContactMessage.countDocuments() : Promise.resolve(0),
      canMessages ? ContactMessage.countDocuments({ status: 'unread' }) : Promise.resolve(0),
      canMessages
        ? ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean()
        : Promise.resolve([]),
    ]);

  res.json({
    stats: { portfolios, published, featured, categories, messages, unread },
    recentMessages,
  });
});
