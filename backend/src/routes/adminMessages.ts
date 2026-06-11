import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validateBody } from '../middleware/validate.js';
import { ContactMessage } from '../models/ContactMessage.js';

export const adminMessagesRouter = Router();

adminMessagesRouter.get('/', requirePermission('messages.view'), async (req, res) => {
  const { search, status } = req.query as { search?: string; status?: string };
  const filter: Record<string, unknown> = {};
  if (status === 'read' || status === 'unread') filter.status = status;
  if (search) {
    const pattern = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { fullName: { $regex: pattern, $options: 'i' } },
      { email: { $regex: pattern, $options: 'i' } },
      { shootType: { $regex: pattern, $options: 'i' } },
      { message: { $regex: pattern, $options: 'i' } },
    ];
  }
  const items = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ items });
});

adminMessagesRouter.get('/:id', requirePermission('messages.view'), async (req, res) => {
  const item = await ContactMessage.findById(req.params.id).lean();
  if (!item) throw new HttpError(404, 'Message not found');
  res.json({ item });
});

const statusSchema = z.object({ status: z.enum(['read', 'unread']) });

adminMessagesRouter.patch('/:id/status', requirePermission('messages.manage'), validateBody(statusSchema), async (req, res) => {
  const item = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: (req.body as { status: string }).status },
    { returnDocument: 'after' },
  ).lean();
  if (!item) throw new HttpError(404, 'Message not found');
  res.json({ item });
});

adminMessagesRouter.delete('/:id', requirePermission('messages.manage'), async (req, res) => {
  const item = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!item) throw new HttpError(404, 'Message not found');
  res.json({ ok: true });
});
