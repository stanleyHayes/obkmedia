import dotenv from 'dotenv';

dotenv.config();

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 5174),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/obkmedia'),
  jwtSecret: required('JWT_SECRET', 'obkmedia-dev-secret-change-in-production'),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    configured: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    ),
  },
  resendApiKey: process.env.RESEND_API_KEY,
  contactNotifyEmail: process.env.CONTACT_NOTIFY_EMAIL ?? 'Obkmedia30@gmail.com',
  contactFromEmail: process.env.CONTACT_FROM_EMAIL ?? 'OBK MEDIA <onboarding@resend.dev>',
  adminEmail: process.env.ADMIN_EMAIL ?? 'Obkmedia30@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'obkmedia-admin',
};
