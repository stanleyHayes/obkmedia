import { Schema, model, type InferSchemaType } from 'mongoose';

const portfolioImageSchema = new Schema(
  {
    portfolioId: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
      index: true,
    },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    caption: { type: String, trim: true, maxlength: 255 },
    altText: { type: String, trim: true, maxlength: 255 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type PortfolioImageDoc = InferSchemaType<typeof portfolioImageSchema>;
export const PortfolioImage = model('PortfolioImage', portfolioImageSchema);
