import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';
import surveyRoutes from './routes/survey.routes';
import { errorHandler } from './middleware/error.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { logger } from './utils/logger';
import { register } from './monitoring/metrics';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = 3000; // Fixed port number

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// API Routes
app.use('/api/v1/surveys', surveyRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});