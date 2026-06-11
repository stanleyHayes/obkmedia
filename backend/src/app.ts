import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { adminAuthRouter } from './routes/adminAuth.js';
import { adminCategoriesRouter } from './routes/adminCategories.js';
import { adminMessagesRouter } from './routes/adminMessages.js';
import { adminNotificationsRouter } from './routes/adminNotifications.js';
import { adminPortfolioRouter } from './routes/adminPortfolio.js';
import { adminRolesRouter } from './routes/adminRoles.js';
import { adminStatsRouter } from './routes/adminStats.js';
import { adminUsersRouter } from './routes/adminUsers.js';
import { publicRouter } from './routes/public.js';
import { LOCAL_UPLOAD_DIR } from './services/uploads.js';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.clientOrigin.split(',').map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  // Local-disk uploads (dev fallback when Cloudinary is not configured)
  app.use('/uploads', express.static(LOCAL_UPLOAD_DIR, { maxAge: '7d', immutable: true }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'obkmedia-api' });
  });

  app.use('/api/public', publicRouter);
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/admin/portfolio', requireAuth, adminPortfolioRouter);
  app.use('/api/admin/categories', requireAuth, adminCategoriesRouter);
  app.use('/api/admin/contact-messages', requireAuth, adminMessagesRouter);
  app.use('/api/admin/notifications', requireAuth, adminNotificationsRouter);
  app.use('/api/admin/stats', requireAuth, adminStatsRouter);
  app.use('/api/admin/users', requireAuth, adminUsersRouter);
  app.use('/api/admin/roles', requireAuth, adminRolesRouter);
  // Spec alias: POST /api/admin/uploads/image
  app.use(
    '/api/admin/uploads',
    requireAuth,
    (req, _res, next) => {
      req.url = `/uploads${req.url}`;
      next();
    },
    adminPortfolioRouter,
  );

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
