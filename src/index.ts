import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';
import { createRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { logger } from './utils/logger';
import { register } from './monitoring/metrics';

dotenv.config();
initializeFirebase();

const app = express();
const port = process.env.API_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Routes
createRoutes(app);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  console.log(`Server is running on port ${port}`);
});