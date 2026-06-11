import { Router } from 'express';
import { requirePermission } from '../middleware/auth.js';
import { ContactMessage } from '../models/ContactMessage.js';

export const adminNotificationsRouter = Router();

/**
 * Lightweight feed for the admin notification bell: unread contact messages,
 * newest first, plus the total unread count. Gated by messages.view so it can
 * be polled cheaply without leaking inquiry PII to unauthorized roles.
 */
adminNotificationsRouter.get('/', requirePermission('messages.view'), async (_req, res) => {
  const [count, items] = await Promise.all([
    ContactMessage.countDocuments({ status: 'unread' }),
    ContactMessage.find({ status: 'unread' })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('fullName shootType message createdAt')
      .lean(),
  ]);
  res.json({
    count,
    items: items.map((m) => ({
      id: String(m._id),
      fullName: m.fullName,
      shootType: m.shootType ?? '',
      message: m.message,
      createdAt: m.createdAt,
    })),
  });
});
