// Express application entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import songRoutes from './routes/songs';
import versionRoutes from './routes/versions';
import { errorHandler } from './middleware/errorHandler';
import { startCrawlerScheduler } from './crawler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/versions', versionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ code: 0, status: 'ok' });
});

// Crawler routes
app.post('/api/crawler/trigger', (req, res) => {
  const { triggerManualCrawl } = require('./crawler');
  triggerManualCrawl()
    .then(() => {
      res.json({ code: 0, message: 'Crawl triggered' });
    })
    .catch(err => {
      res.status(500).json({ code: 500, message: err.message });
    });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Start crawler scheduler
  startCrawlerScheduler();
});

export default app;