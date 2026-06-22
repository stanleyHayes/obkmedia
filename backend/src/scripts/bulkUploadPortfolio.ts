/**
 * One-off bulk import for the client's real portfolio photos.
 *
 * - Uploads pre-optimized web images from WEB_DIR to Cloudinary under
 *   folder `obkmedia/portfolio`, tagged TAG for easy rollback.
 * - Replaces the picsum.photos demo placeholders with four real, published
 *   category collections (Wedding, Studio Portrait, Fashion, Events).
 * - Stores f_auto,q_auto delivery URLs so the browser gets WebP/AVIF + lazy
 *   loading handles the rest.
 *
 * Re-runnable: existing collections (by slug) and their Cloudinary assets are
 * destroyed before re-creation.
 *
 * Run: cd backend && npx tsx src/scripts/bulkUploadPortfolio.ts
 */
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { Category } from '../models/Category.js';
import { Portfolio } from '../models/Portfolio.js';
import { PortfolioImage } from '../models/PortfolioImage.js';
import { slugify } from '../utils/slugify.js';

const WEB_DIR = '/tmp/obk_pics/web';
const TAG = 'bulk-2026-06';
const CLOUD_FOLDER = 'obkmedia/portfolio';

interface Collection {
  slug: string;
  title: string;
  categorySlug: string;
  shortDescription: string;
  fullDescription: string;
  cover: string;
  files: string[];
}

const COLLECTIONS: Collection[] = [
  {
    slug: 'wedding-photography',
    title: 'Wedding Photography',
    categorySlug: 'wedding',
    shortDescription:
      'Traditional, white, and engagement celebrations across Ghana — every vow, tear, and dance preserved.',
    fullDescription:
      'From rich kente and gold of the traditional rites to the elegance of the white wedding, we document the full story of your day with a complete photo and cinema team.',
    cover: 'IMG_5650.jpg',
    files: [
      'IMG_5650.jpg', 'DSC_7897.jpg', 'DSC_7914.jpg', 'DSC_7926.jpg', 'IMG_0716.jpg',
      'IMG_4804.jpg', 'IMG_5703.jpg', 'IMG_5711.jpg', 'IMG_5726.jpg', 'IMG_5751.jpg', 'IMG_5779.jpg',
    ],
  },
  {
    slug: 'studio-portraits',
    title: 'Studio Portraits',
    categorySlug: 'studio-portrait',
    shortDescription:
      'Editorial and personal studio sessions — maternity, glamour, traditional, and signature portraiture.',
    fullDescription:
      'Considered light, styling, and direction for portraits that feel like you. Maternity, milestone, and personal-brand sessions shot in studio.',
    cover: 'IMG_0264.jpg',
    files: [
      'IMG_0264.jpg', 'DSC_7624.jpg', 'IMG_3396.jpg', 'IMG_3402.jpg', 'IMG_4989.jpg', 'IMG_4994.jpg',
      'IMG_4995.jpg', 'IMG_5132.jpg', 'IMG_5318.jpg', 'IMG_5752.jpg', 'IMG_5961.jpg', 'IMG_6603.jpg',
      'IMG_6977.jpg', 'IMG_7567.jpg', 'IMG_7570.jpg',
    ],
  },
  {
    slug: 'fashion-editorial',
    title: 'Fashion & Editorial',
    categorySlug: 'fashion',
    shortDescription:
      'Fashion, lifestyle, and creative storytelling with bold styling, colour, and light.',
    fullDescription:
      'Concept-led shoots for designers, brands, and creatives — from clean studio fashion to dramatic, on-location editorial.',
    cover: 'IMG_9897.jpg',
    files: [
      'IMG_9897.jpg', 'IMG_0006.jpg', 'IMG_0029.jpg', 'IMG_4997.jpg', 'IMG_6515.jpg',
      'IMG_6574.jpg', 'IMG_6987.jpg', 'IMG_7451.jpg', 'IMG_8213.jpg', 'IMG_8382.jpg',
    ],
  },
  {
    slug: 'events-coverage',
    title: 'Events Coverage',
    categorySlug: 'events',
    shortDescription:
      'Corporate and social events, gatherings, and milestone celebrations captured as they happen.',
    fullDescription:
      'Honest, unscripted coverage of the moments that matter — group celebrations, outdoor shoots, and special occasions.',
    cover: 'IMG_2205.jpg',
    files: ['IMG_2205.jpg', 'IMG_0911.jpg', 'IMG_2261.jpg', 'IMG_7487.jpg'],
  },
];

function optimizedUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ fetch_format: 'auto', quality: 'auto', width: 1800, crop: 'limit' }],
  });
}

async function main(): Promise<void> {
  if (!env.cloudinary.configured) throw new Error('Cloudinary is not configured in .env');
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });

  await connectDb();

  // --- 1. Remove picsum.photos demo placeholders ---
  const demos = await Portfolio.find({ coverImageUrl: /picsum\.photos/ }).select('_id title').lean();
  if (demos.length) {
    const ids = demos.map((d) => d._id);
    await PortfolioImage.deleteMany({ portfolioId: { $in: ids } });
    await Portfolio.deleteMany({ _id: { $in: ids } });
    console.log(`[bulk] removed ${demos.length} demo portfolio(s): ${demos.map((d) => d.title).join(', ')}`);
  }

  // --- 2. Map category slugs to ids ---
  const cats = await Category.find().select('_id slug').lean();
  const catId = new Map(cats.map((c) => [c.slug, c._id]));

  let order = 0;
  for (const col of COLLECTIONS) {
    // Idempotency: tear down any prior run of this collection (DB + Cloudinary).
    const existing = await Portfolio.findOne({ slug: col.slug }).lean();
    if (existing) {
      const imgs = await PortfolioImage.find({ portfolioId: existing._id }).select('imagePublicId').lean();
      const publicIds = [existing.coverImagePublicId, ...imgs.map((i) => i.imagePublicId)].filter(Boolean) as string[];
      for (const pid of publicIds) {
        try { await cloudinary.uploader.destroy(pid); } catch { /* ignore */ }
      }
      await PortfolioImage.deleteMany({ portfolioId: existing._id });
      await Portfolio.deleteOne({ _id: existing._id });
      console.log(`[bulk] replaced existing collection: ${col.slug}`);
    }

    // Upload all files; remember each public_id.
    const uploaded = new Map<string, string>(); // file -> public_id
    for (const file of col.files) {
      const base = file.replace(/\.[^.]+$/, '');
      const res = await cloudinary.uploader.upload(`${WEB_DIR}/${file}`, {
        folder: CLOUD_FOLDER,
        public_id: base,
        overwrite: true,
        tags: [TAG, col.categorySlug],
        resource_type: 'image',
      });
      uploaded.set(file, res.public_id);
      process.stdout.write('.');
    }
    process.stdout.write('\n');

    const coverPublicId = uploaded.get(col.cover)!;
    const portfolio = await Portfolio.create({
      title: col.title,
      slug: slugify(col.slug),
      shortDescription: col.shortDescription,
      fullDescription: col.fullDescription,
      categoryId: catId.get(col.categorySlug) ?? null,
      coverImageUrl: optimizedUrl(coverPublicId),
      coverImagePublicId: coverPublicId,
      location: 'Kumasi, Ghana',
      isFeatured: true,
      isPublished: true,
      sortOrder: order++,
    });

    let imgOrder = 0;
    for (const file of col.files) {
      const pid = uploaded.get(file)!;
      await PortfolioImage.create({
        portfolioId: portfolio._id,
        imageUrl: optimizedUrl(pid),
        imagePublicId: pid,
        altText: `${col.title} — OBK MEDIA`,
        sortOrder: imgOrder++,
      });
    }
    console.log(`[bulk] ${col.title}: ${col.files.length} images, published`);
  }

  await mongoose.disconnect();
  console.log('[bulk] done.');
}

main().catch((err) => {
  console.error('[bulk] failed', err);
  process.exit(1);
});
