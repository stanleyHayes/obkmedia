import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { Category } from '../models/Category.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Portfolio } from '../models/Portfolio.js';
import { PortfolioImage } from '../models/PortfolioImage.js';
import { sendContactNotification } from '../services/email.js';

export const publicRouter = Router();

const PORTFOLIO_LIST_FIELDS =
  'title slug shortDescription coverImageUrl shootDate location categoryId isFeatured sortOrder';

publicRouter.get('/portfolio', async (req, res) => {
  const { category, search } = req.query as { category?: string; search?: string };
  const filter: Record<string, unknown> = { isPublished: true };

  if (category) {
    const cat = await Category.findOne({ slug: category }).select('_id').lean();
    if (!cat) {
      res.json({ items: [] });
      return;
    }
    filter.categoryId = cat._id;
  }
  if (search) {
    filter.title = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  const items = await Portfolio.find(filter)
    .select(PORTFOLIO_LIST_FIELDS)
    .populate('categoryId', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  res.json({ items });
});

publicRouter.get('/portfolio/featured', async (_req, res) => {
  const items = await Portfolio.find({ isPublished: true, isFeatured: true })
    .select(PORTFOLIO_LIST_FIELDS)
    .populate('categoryId', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(8)
    .lean();
  res.json({ items });
});

publicRouter.get('/portfolio/:slug', async (req, res) => {
  const item = await Portfolio.findOne({ slug: req.params.slug, isPublished: true })
    .populate('categoryId', 'name slug')
    .lean();
  if (!item) {
    res.status(404).json({ error: 'Portfolio not found' });
    return;
  }
  const relatedFilter: Record<string, unknown> = { isPublished: true, _id: { $ne: item._id } };
  if (item.categoryId) {
    relatedFilter.categoryId = (item.categoryId as { _id: unknown })._id;
  }
  const [images, related] = await Promise.all([
    PortfolioImage.find({ portfolioId: item._id }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    Portfolio.find(relatedFilter)
      .select(PORTFOLIO_LIST_FIELDS)
      .populate('categoryId', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(3)
      .lean(),
  ]);
  res.json({ item, images, related });
});

publicRouter.get('/categories', async (_req, res) => {
  const items = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ items });
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions — please try again later' },
});

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(150),
  email: z.email('Please enter a valid email address').max(255),
  phone: z.string().trim().max(100).optional().or(z.literal('')),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  shootType: z.string().trim().max(150).optional().or(z.literal('')),
  preferredDate: z.string().trim().optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  budgetRange: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please tell us a little about your project').max(5000),
  // Honeypot — real users never fill this hidden field.
  website: z.string().max(0, 'Submission rejected').optional().or(z.literal('')),
});

publicRouter.post('/contact', contactLimiter, validateBody(contactSchema), async (req, res) => {
  const body = req.body as z.infer<typeof contactSchema>;
  const preferredDate = body.preferredDate ? new Date(body.preferredDate) : null;

  const saved = await ContactMessage.create({
    fullName: body.fullName,
    email: body.email,
    phone: body.phone || undefined,
    company: body.company || undefined,
    shootType: body.shootType || undefined,
    preferredDate: preferredDate && !Number.isNaN(preferredDate.getTime()) ? preferredDate : null,
    location: body.location || undefined,
    budgetRange: body.budgetRange || undefined,
    message: body.message,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  await sendContactNotification(saved);
  res.status(201).json({ ok: true, message: 'Thank you — we will be in touch shortly.' });
});
