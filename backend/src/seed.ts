/**
 * Seeds the database with the OBK MEDIA admin account, portfolio categories,
 * and demo portfolio projects so the site is browsable immediately.
 *
 * Run: npm run seed
 */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { SYSTEM_ROLES } from './config/permissions.js';
import { Admin } from './models/Admin.js';
import { Category } from './models/Category.js';
import { Portfolio } from './models/Portfolio.js';
import { PortfolioImage } from './models/PortfolioImage.js';
import { Role } from './models/Role.js';

const img = (seed: string, w = 1600, h = 1067): string =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function seed(): Promise<void> {
  await connectDb();

  // ---- Roles ----
  const roles = new Map<string, mongoose.Types.ObjectId>();
  for (const def of SYSTEM_ROLES) {
    const role = await Role.findOneAndUpdate(
      { name: def.name },
      { ...def, isSystem: true },
      { upsert: true, returnDocument: 'after' },
    );
    roles.set(def.name, role._id);
  }
  console.log(`[seed] ${SYSTEM_ROLES.length} system roles ready`);

  // ---- Admin users ----
  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await Admin.findOneAndUpdate(
    { email: env.adminEmail.toLowerCase() },
    {
      fullName: 'OBK MEDIA',
      email: env.adminEmail.toLowerCase(),
      passwordHash,
      roleId: roles.get('Owner'),
      isActive: true,
    },
    { upsert: true, returnDocument: 'after' },
  );
  console.log(`[seed] owner ready: ${env.adminEmail}`);

  // Demo editor account showing restricted access (change/remove in production).
  const editorHash = await bcrypt.hash('obkmedia-editor', 12);
  await Admin.findOneAndUpdate(
    { email: 'editor@obkmedia.com' },
    {
      fullName: 'Demo Editor',
      email: 'editor@obkmedia.com',
      passwordHash: editorHash,
      roleId: roles.get('Editor'),
      isActive: true,
    },
    { upsert: true, returnDocument: 'after' },
  );
  console.log('[seed] demo editor ready: editor@obkmedia.com');

  // ---- Categories ----
  const categoryDefs = [
    { name: 'Wedding', slug: 'wedding', description: 'Traditional, white, and destination weddings', sortOrder: 0 },
    { name: 'Studio Portrait', slug: 'studio-portrait', description: 'Editorial and personal studio sessions', sortOrder: 1 },
    { name: 'Events', slug: 'events', description: 'Corporate and social event coverage', sortOrder: 2 },
    { name: 'Fashion', slug: 'fashion', description: 'Fashion and lifestyle storytelling', sortOrder: 3 },
  ];
  const categories = new Map<string, mongoose.Types.ObjectId>();
  for (const def of categoryDefs) {
    const cat = await Category.findOneAndUpdate({ slug: def.slug }, def, {
      upsert: true,
      returnDocument: 'after',
    });
    categories.set(def.slug, cat._id);
  }
  console.log(`[seed] ${categoryDefs.length} categories ready`);

  // ---- Portfolios ----
  const portfolioDefs = [
    {
      title: 'Akosua & Kwame — A Kumasi Love Story',
      slug: 'akosua-kwame-kumasi-love-story',
      category: 'wedding',
      shortDescription: 'A two-day traditional and white wedding celebration in the heart of Kumasi.',
      fullDescription:
        'From the rich kente of the traditional ceremony to the candlelit elegance of the white wedding, Akosua and Kwame trusted us to preserve every tear, every laugh, and every dance. Shot across two days with a full photo and cinema team.',
      location: 'Kumasi, Ghana',
      clientName: 'Akosua & Kwame',
      shootDate: '2025-11-22',
      isFeatured: true,
      seedKey: 'obk-wedding-1',
      galleryCount: 8,
    },
    {
      title: 'The Adjei Engagement',
      slug: 'adjei-engagement',
      category: 'wedding',
      shortDescription: 'An intimate engagement session at sunset — golden light and quiet promises.',
      fullDescription:
        'Beautiful storytelling sessions that celebrate your love journey. This engagement shoot wove together the couple’s favourite places with the golden hour light of the Ashanti region.',
      location: 'Abuakwa-Nkawie',
      clientName: 'The Adjei Family',
      shootDate: '2025-09-14',
      isFeatured: true,
      seedKey: 'obk-engage-1',
      galleryCount: 6,
    },
    {
      title: 'Crowned — Studio Portrait Series',
      slug: 'crowned-studio-portrait-series',
      category: 'studio-portrait',
      shortDescription: 'A dramatic studio series celebrating identity, heritage, and light.',
      fullDescription:
        'Shot against deep tones with sculpted lighting, Crowned is a portrait series about presence. Every frame is directed, lit, and finished with the master’s touch.',
      location: 'OBK Studio',
      shootDate: '2025-08-02',
      isFeatured: true,
      seedKey: 'obk-portrait-1',
      galleryCount: 6,
    },
    {
      title: 'Ghana Tech Summit — Official Coverage',
      slug: 'ghana-tech-summit-coverage',
      category: 'events',
      shortDescription: 'Full-day corporate coverage: keynotes, candids, and brand storytelling.',
      fullDescription:
        'Corporate media production for one of the region’s leading technology gatherings — stage photography, delegate portraits, and same-day social media deliverables.',
      location: 'Accra, Ghana',
      clientName: 'Ghana Tech Summit',
      shootDate: '2025-10-05',
      isFeatured: false,
      seedKey: 'obk-event-1',
      galleryCount: 5,
    },
    {
      title: 'Threads of the North — Fashion Editorial',
      slug: 'threads-of-the-north-editorial',
      category: 'fashion',
      shortDescription: 'A fashion editorial pairing contemporary silhouettes with northern textiles.',
      fullDescription:
        'An editorial collaboration with emerging Ghanaian designers — bold colour, motion, and texture, photographed on location and finished for print.',
      location: 'Tamale, Ghana',
      shootDate: '2025-07-18',
      isFeatured: true,
      seedKey: 'obk-fashion-1',
      galleryCount: 6,
    },
    {
      title: 'A Celebration of Life — Nana Yaa',
      slug: 'celebration-of-life-nana-yaa',
      category: 'events',
      shortDescription: 'Dignified funeral coverage honouring a matriarch’s extraordinary life.',
      fullDescription:
        'Funeral coverage handled with discretion and care — documenting tributes, family, and tradition so the memories live beyond the day.',
      location: 'Nkawie, Ghana',
      shootDate: '2025-06-21',
      isFeatured: false,
      seedKey: 'obk-funeral-1',
      galleryCount: 4,
    },
  ];

  for (const [index, def] of portfolioDefs.entries()) {
    const portfolio = await Portfolio.findOneAndUpdate(
      { slug: def.slug },
      {
        title: def.title,
        slug: def.slug,
        categoryId: categories.get(def.category) ?? null,
        shortDescription: def.shortDescription,
        fullDescription: def.fullDescription,
        coverImageUrl: img(`${def.seedKey}-cover`),
        shootDate: new Date(def.shootDate),
        location: def.location,
        clientName: def.clientName ?? '',
        isFeatured: def.isFeatured,
        isPublished: true,
        sortOrder: index,
      },
      { upsert: true, returnDocument: 'after' },
    );

    const existing = await PortfolioImage.countDocuments({ portfolioId: portfolio._id });
    if (existing === 0) {
      await PortfolioImage.insertMany(
        Array.from({ length: def.galleryCount }, (_, i) => ({
          portfolioId: portfolio._id,
          imageUrl: img(`${def.seedKey}-${i + 1}`),
          altText: `${def.title} — frame ${i + 1}`,
          sortOrder: i,
        })),
      );
    }
  }
  console.log(`[seed] ${portfolioDefs.length} portfolios ready`);

  await mongoose.disconnect();
  console.log('[seed] done');
}

seed().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
