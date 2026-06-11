import { Router } from 'express';
import { z } from 'zod';
import { requirePermission, type AuthedRequest } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { validateBody } from '../middleware/validate.js';
import { Portfolio } from '../models/Portfolio.js';
import { PortfolioImage } from '../models/PortfolioImage.js';
import { deleteImage, imageUpload, storeImage } from '../services/uploads.js';
import { slugify } from '../utils/slugify.js';

export const adminPortfolioRouter = Router();

const portfolioSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().max(220).optional().or(z.literal('')),
  shortDescription: z.string().trim().min(2).max(600),
  fullDescription: z.string().trim().max(10000).optional().or(z.literal('')),
  categoryId: z.string().trim().optional().nullable().or(z.literal('')),
  coverImageUrl: z.string().trim().min(1, 'Cover image is required'),
  coverImagePublicId: z.string().trim().optional().or(z.literal('')),
  shootDate: z.string().trim().optional().nullable().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  clientName: z.string().trim().max(200).optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

function toPortfolioFields(body: z.infer<typeof portfolioSchema>, canPublish: boolean) {
  const shootDate = body.shootDate ? new Date(body.shootDate) : null;
  return {
    title: body.title,
    slug: slugify(body.slug || body.title),
    shortDescription: body.shortDescription,
    fullDescription: body.fullDescription || '',
    categoryId: body.categoryId || null,
    coverImageUrl: body.coverImageUrl,
    coverImagePublicId: body.coverImagePublicId || undefined,
    shootDate: shootDate && !Number.isNaN(shootDate.getTime()) ? shootDate : null,
    location: body.location || '',
    clientName: body.clientName || '',
    // Publish/feature state is only honored for users who hold portfolio.publish;
    // manage-only users always create drafts and must request publishing.
    isFeatured: canPublish ? (body.isFeatured ?? false) : false,
    isPublished: canPublish ? (body.isPublished ?? false) : false,
    sortOrder: body.sortOrder ?? 0,
  };
}

adminPortfolioRouter.get('/', requirePermission('portfolio.view'), async (_req, res) => {
  const items = await Portfolio.find()
    .populate('categoryId', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  const counts = await PortfolioImage.aggregate<{ _id: unknown; count: number }>([
    { $group: { _id: '$portfolioId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    items: items.map((item) => ({ ...item, imageCount: countMap.get(String(item._id)) ?? 0 })),
  });
});

adminPortfolioRouter.post('/', requirePermission('portfolio.manage'), validateBody(portfolioSchema), async (req: AuthedRequest, res) => {
  const canPublish = req.adminPermissions?.includes('portfolio.publish') ?? false;
  const item = await Portfolio.create(toPortfolioFields(req.body, canPublish));
  res.status(201).json({ item });
});

adminPortfolioRouter.get('/:id', requirePermission('portfolio.view'), async (req, res) => {
  const item = await Portfolio.findById(req.params.id).lean();
  if (!item) throw new HttpError(404, 'Portfolio not found');
  const images = await PortfolioImage.find({ portfolioId: item._id })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  res.json({ item, images });
});

adminPortfolioRouter.patch('/:id', requirePermission('portfolio.manage'), validateBody(portfolioSchema.partial()), async (req: AuthedRequest, res) => {
  const body = req.body as Partial<z.infer<typeof portfolioSchema>>;
  const update: Record<string, unknown> = { ...body };
  // Publish/feature changes require portfolio.publish — strip them otherwise so
  // a manage-only user cannot push content live through the generic update.
  if (!req.adminPermissions?.includes('portfolio.publish')) {
    delete update.isPublished;
    delete update.isFeatured;
  }
  if (body.title !== undefined || body.slug !== undefined) {
    update.slug = slugify(body.slug || body.title || '');
    if (!update.slug) delete update.slug;
  }
  if (body.shootDate !== undefined) {
    const date = body.shootDate ? new Date(body.shootDate) : null;
    update.shootDate = date && !Number.isNaN(date.getTime()) ? date : null;
  }
  if (body.categoryId !== undefined) update.categoryId = body.categoryId || null;
  const item = await Portfolio.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!item) throw new HttpError(404, 'Portfolio not found');
  res.json({ item });
});

adminPortfolioRouter.delete('/:id', requirePermission('portfolio.manage'), async (req, res) => {
  const item = await Portfolio.findByIdAndDelete(req.params.id);
  if (!item) throw new HttpError(404, 'Portfolio not found');
  const images = await PortfolioImage.find({ portfolioId: item._id }).lean();
  await PortfolioImage.deleteMany({ portfolioId: item._id });
  await Promise.all([
    deleteImage(item.coverImagePublicId),
    ...images.map((img) => deleteImage(img.imagePublicId)),
  ]);
  res.json({ ok: true });
});

const toggleSchema = z.object({ value: z.boolean() });

adminPortfolioRouter.patch('/:id/publish', requirePermission('portfolio.publish'), validateBody(toggleSchema), async (req, res) => {
  const item = await Portfolio.findByIdAndUpdate(
    req.params.id,
    { isPublished: (req.body as { value: boolean }).value },
    { returnDocument: 'after' },
  ).lean();
  if (!item) throw new HttpError(404, 'Portfolio not found');
  res.json({ item });
});

adminPortfolioRouter.patch('/:id/feature', requirePermission('portfolio.publish'), validateBody(toggleSchema), async (req, res) => {
  const item = await Portfolio.findByIdAndUpdate(
    req.params.id,
    { isFeatured: (req.body as { value: boolean }).value },
    { returnDocument: 'after' },
  ).lean();
  if (!item) throw new HttpError(404, 'Portfolio not found');
  res.json({ item });
});

// ---- Gallery images ----

adminPortfolioRouter.post('/:id/images', requirePermission('portfolio.manage'), imageUpload.array('images', 20), async (req, res) => {
  const portfolio = await Portfolio.findById(req.params.id).lean();
  if (!portfolio) throw new HttpError(404, 'Portfolio not found');
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new HttpError(400, 'No images provided');

  const last = await PortfolioImage.findOne({ portfolioId: portfolio._id })
    .sort({ sortOrder: -1 })
    .select('sortOrder')
    .lean();
  let nextOrder = (last?.sortOrder ?? -1) + 1;

  const created = [];
  for (const file of files) {
    const stored = await storeImage(file);
    created.push(
      await PortfolioImage.create({
        portfolioId: portfolio._id,
        imageUrl: stored.url,
        imagePublicId: stored.publicId,
        altText: portfolio.title,
        sortOrder: nextOrder++,
      }),
    );
  }
  res.status(201).json({ images: created });
});

const reorderSchema = z.object({ imageIds: z.array(z.string()).min(1) });

adminPortfolioRouter.patch('/:id/images/reorder', requirePermission('portfolio.manage'), validateBody(reorderSchema), async (req, res) => {
  const { imageIds } = req.body as { imageIds: string[] };
  await Promise.all(
    imageIds.map((imageId, index) =>
      PortfolioImage.updateOne(
        { _id: imageId, portfolioId: req.params.id },
        { sortOrder: index },
      ),
    ),
  );
  const images = await PortfolioImage.find({ portfolioId: req.params.id })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  res.json({ images });
});

const imageMetaSchema = z.object({
  caption: z.string().trim().max(255).optional().or(z.literal('')),
  altText: z.string().trim().max(255).optional().or(z.literal('')),
});

adminPortfolioRouter.patch('/images/:imageId', requirePermission('portfolio.manage'), validateBody(imageMetaSchema), async (req, res) => {
  const image = await PortfolioImage.findByIdAndUpdate(req.params.imageId, req.body, {
    returnDocument: 'after',
  }).lean();
  if (!image) throw new HttpError(404, 'Image not found');
  res.json({ image });
});

adminPortfolioRouter.delete('/images/:imageId', requirePermission('portfolio.manage'), async (req, res) => {
  const image = await PortfolioImage.findByIdAndDelete(req.params.imageId);
  if (!image) throw new HttpError(404, 'Image not found');
  await deleteImage(image.imagePublicId);
  res.json({ ok: true });
});

// ---- Cover/general image upload (returns URL for the form) ----

adminPortfolioRouter.post('/uploads/image', requirePermission('portfolio.manage'), imageUpload.single('image'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No image provided');
  const stored = await storeImage(req.file);
  res.status(201).json(stored);
});
