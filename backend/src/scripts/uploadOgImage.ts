import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

const file = process.env.OG_FILE;
if (!file) throw new Error('Set OG_FILE');
const res = await cloudinary.uploader.upload(file, {
  public_id: 'obkmedia/og-card',
  overwrite: true,
  invalidate: true,
  resource_type: 'image',
});
console.log('SECURE_URL=' + res.secure_url);
