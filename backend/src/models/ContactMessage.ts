import { Schema, model, type InferSchemaType } from 'mongoose';

const contactMessageSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, trim: true, maxlength: 255 },
    phone: { type: String, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 200 },
    shootType: { type: String, trim: true, maxlength: 150 },
    preferredDate: { type: Date, default: null },
    location: { type: String, trim: true, maxlength: 200 },
    budgetRange: { type: String, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
);

export type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema>;
export const ContactMessage = model('ContactMessage', contactMessageSchema);
