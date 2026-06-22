import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { SETTINGS_IMAGE_FIELDS, SITE_SETTINGS_KEY, SiteSettings } from '../models/SiteSettings.js';
import { deleteImage } from '../services/uploads.js';

export const adminSettingsRouter = Router();

const str = (max: number) => z.string().trim().max(max).optional();

const statSchema = z.object({ value: z.string().trim().max(40), label: z.string().trim().max(80) });
const serviceSchema = z.object({ title: z.string().trim().max(120), description: z.string().trim().max(800) });
const socialSchema = z.object({ name: z.string().trim().max(40), url: z.string().trim().max(400) });
const outdoorTierSchema = z.object({ label: z.string().trim().max(60), price: z.string().trim().max(40) });
const weddingPackageSchema = z.object({
  name: z.string().trim().max(80),
  features: z.array(z.string().trim().max(200)).max(20),
  oneDay: z.string().trim().max(40),
  twoDays: z.string().trim().max(40),
  popular: z.boolean().optional(),
});

const settingsSchema = z.object({
  brandName: str(120),
  tagline: str(160),
  logoLightUrl: str(600),
  logoLightPublicId: str(300),
  logoDarkUrl: str(600),
  logoDarkPublicId: str(300),

  heroHeadline: str(200),
  heroSubheadline: str(400),
  heroImageUrl: str(600),
  heroImagePublicId: str(300),

  aboutImageUrl: str(600),
  aboutImagePublicId: str(300),
  aboutParagraphs: z.array(z.string().trim().max(2000)).max(10).optional(),
  aboutDifference: str(600),
  mission: str(1000),
  vision: str(1000),
  stats: z.array(statSchema).max(6).optional(),

  services: z.array(serviceSchema).max(24).optional(),

  pricing: z
    .object({
      intro: str(600),
      currency: str(8),
      outdoorTitle: str(120),
      outdoorNote: str(160),
      outdoor: z.array(outdoorTierSchema).max(12).optional(),
      weddingTitle: str(120),
      wedding: z.array(weddingPackageSchema).max(12).optional(),
    })
    .optional(),

  email: str(255),
  phone: str(60),
  phoneIntl: str(60),
  whatsappUrl: str(400),

  location: str(200),
  mapsUrl: str(400),
  hours: str(160),
  areasServed: str(120),

  socials: z.array(socialSchema).max(12).optional(),
});

type SettingsBody = z.infer<typeof settingsSchema>;

async function getOrCreate() {
  return SiteSettings.findOneAndUpdate(
    { key: SITE_SETTINGS_KEY },
    { $setOnInsert: { key: SITE_SETTINGS_KEY } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
}

adminSettingsRouter.get('/', requirePermission('settings.view'), async (_req, res) => {
  const settings = await getOrCreate();
  res.json({ settings });
});

adminSettingsRouter.patch(
  '/',
  requirePermission('settings.manage'),
  validateBody(settingsSchema),
  async (req, res) => {
    const body = req.body as SettingsBody;
    const current = (await getOrCreate()) as Record<string, unknown>;

    // Free the old Cloudinary asset when an image field is being replaced.
    for (const field of SETTINGS_IMAGE_FIELDS) {
      const incoming = (body as Record<string, unknown>)[field.publicId] as string | undefined;
      const existing = current[field.publicId] as string | undefined;
      if (incoming !== undefined && existing && existing !== incoming) {
        await deleteImage(existing);
      }
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: SITE_SETTINGS_KEY },
      { $set: body },
      { new: true, upsert: true },
    ).lean();
    res.json({ settings });
  },
);
