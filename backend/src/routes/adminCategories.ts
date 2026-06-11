import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validateBody } from '../middleware/validate.js';
import { Category } from '../models/Category.js';
import { Portfolio } from '../models/Portfolio.js';
import { slugify } from '../utils/slugify.js';

export const adminCategoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().max(180).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  sortOrder: z.number().int().optional(),
});

adminCategoriesRouter.get('/', requirePermission('categories.view'), async (_req, res) => {
  const items = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  const counts = await Portfolio.aggregate<{ _id: unknown; count: number }>([
    { $match: { categoryId: { $ne: null } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    items: items.map((item) => ({ ...item, portfolioCount: countMap.get(String(item._id)) ?? 0 })),
  });
});

adminCategoriesRouter.post('/', requirePermission('categories.manage'), validateBody(categorySchema), async (req, res) => {
  const body = req.body as z.infer<typeof categorySchema>;
  const item = await Category.create({
    name: body.name,
    slug: slugify(body.slug || body.name),
    description: body.description || '',
    sortOrder: body.sortOrder ?? 0,
  });
  res.status(201).json({ item });
});

adminCategoriesRouter.patch('/:id', requirePermission('categories.manage'), validateBody(categorySchema.partial()), async (req, res) => {
  const body = req.body as Partial<z.infer<typeof categorySchema>>;
  const update: Record<string, unknown> = { ...body };
  if (body.name !== undefined || body.slug !== undefined) {
    const slug = slugify(body.slug || body.name || '');
    if (slug) update.slug = slug;
  }
  const item = await Category.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!item) throw new HttpError(404, 'Category not found');
  res.json({ item });
});

adminCategoriesRouter.delete('/:id', requirePermission('categories.manage'), async (req, res) => {
  const inUse = await Portfolio.countDocuments({ categoryId: req.params.id });
  if (inUse > 0) {
    throw new HttpError(409, `Category is used by ${inUse} portfolio item(s) — reassign them first`);
  }
  const item = await Category.findByIdAndDelete(req.params.id);
  if (!item) throw new HttpError(404, 'Category not found');
  res.json({ ok: true });
});
