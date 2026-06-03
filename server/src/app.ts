// Express application entry point
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import songRoutes from './routes/songs';
import versionRoutes from './routes/versions';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { startCrawlerScheduler, triggerManualCrawl } from './crawler';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: 'Too many attempts, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 100,                  // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: 'Too many requests, please slow down' },
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.set('trust proxy', 1);
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/versions', versionRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, status: 'ok' });
});

// Crawler routes (requires authentication)
app.post('/api/crawler/trigger', authMiddleware, (_req, res) => {
  triggerManualCrawl()
    .then(() => {
      res.json({ code: 0, message: 'Crawl triggered' });
    })
    .catch(err => {
      res.status(500).json({ code: 500, message: 'Crawl failed' });
    });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startCrawlerScheduler();
});

export default app;
