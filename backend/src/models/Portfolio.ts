import { Schema, model, type InferSchemaType } from 'mongoose';

const portfolioSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, trim: true },
    coverImageUrl: { type: String, required: true },
    coverImagePublicId: { type: String },
    shootDate: { type: Date, default: null },
    location: { type: String, trim: true, maxlength: 200 },
    clientName: { type: String, trim: true, maxlength: 200 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

portfolioSchema.index({ isPublished: 1, sortOrder: 1 });
portfolioSchema.index({ title: 'text' });

export type PortfolioDoc = InferSchemaType<typeof portfolioSchema>;
export const Portfolio = model('Portfolio', portfolioSchema);
