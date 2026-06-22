import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * Editable public-site content, stored as a single document (key: 'site').
 * Every field is optional — the frontend falls back to its built-in defaults
 * (content.ts / i18n) whenever a field is empty, so French translations stay
 * intact until an admin overrides a given field.
 */
const statSchema = new Schema({ value: String, label: String }, { _id: false });
const serviceSchema = new Schema({ title: String, description: String }, { _id: false });
const socialSchema = new Schema({ name: String, url: String }, { _id: false });
const outdoorTierSchema = new Schema({ label: String, price: String }, { _id: false });
const weddingPackageSchema = new Schema(
  {
    name: String,
    features: [String],
    oneDay: String,
    twoDays: String,
    popular: Boolean,
  },
  { _id: false },
);

const siteSettingsSchema = new Schema(
  {
    key: { type: String, default: 'site', unique: true, index: true },

    // Branding — separate logos for light and dark themes
    brandName: String,
    tagline: String,
    logoLightUrl: String,
    logoLightPublicId: String,
    logoDarkUrl: String,
    logoDarkPublicId: String,

    // Hero
    heroHeadline: String,
    heroSubheadline: String,
    heroImageUrl: String,
    heroImagePublicId: String,

    // About
    aboutImageUrl: String,
    aboutImagePublicId: String,
    aboutParagraphs: [String],
    aboutDifference: String,
    mission: String,
    vision: String,
    stats: [statSchema],

    // Services ("what we do")
    services: [serviceSchema],

    // Pricing / packages
    pricing: {
      intro: String,
      currency: String,
      outdoorTitle: String,
      outdoorNote: String,
      outdoor: [outdoorTierSchema],
      weddingTitle: String,
      wedding: [weddingPackageSchema],
    },

    // Contact
    email: String,
    phone: String,
    phoneIntl: String,
    whatsappUrl: String,

    // Location / studio
    location: String,
    mapsUrl: String,
    hours: String,
    areasServed: String,

    // Socials
    socials: [socialSchema],
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettings = model('SiteSettings', siteSettingsSchema);

export const SITE_SETTINGS_KEY = 'site';

/** Image fields that own a Cloudinary asset, paired url -> publicId. */
export const SETTINGS_IMAGE_FIELDS = [
  { url: 'logoLightUrl', publicId: 'logoLightPublicId' },
  { url: 'logoDarkUrl', publicId: 'logoDarkPublicId' },
  { url: 'heroImageUrl', publicId: 'heroImagePublicId' },
  { url: 'aboutImageUrl', publicId: 'aboutImagePublicId' },
] as const;
