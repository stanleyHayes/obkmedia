import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errors.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB — high-res photography

export const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

if (env.cloudinary.configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
} else {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      cb(new HttpError(400, 'Only JPEG, PNG, and WebP images are accepted'));
      return;
    }
    cb(null, true);
  },
});

export interface StoredImage {
  url: string;
  publicId: string;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function storeImage(file: Express.Multer.File): Promise<StoredImage> {
  if (env.cloudinary.configured) {
    return new Promise<StoredImage>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'obkmedia', resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(new HttpError(502, 'Image upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${EXT_BY_MIME[file.mimetype] ?? 'jpg'}`;
  await fs.promises.writeFile(path.join(LOCAL_UPLOAD_DIR, name), file.buffer);
  return { url: `/uploads/${name}`, publicId: `local:${name}` };
}

export async function deleteImage(publicId?: string | null): Promise<void> {
  if (!publicId) return;
  try {
    if (publicId.startsWith('local:')) {
      await fs.promises.rm(path.join(LOCAL_UPLOAD_DIR, publicId.slice('local:'.length)), { force: true });
    } else if (env.cloudinary.configured) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error('[uploads] failed to delete image', publicId, err);
  }
}
