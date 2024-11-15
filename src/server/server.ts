import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import apiRoutes from './routes/api';
import { surveyMonitor } from './services/surveyMonitor';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Schedule survey status monitoring
cron.schedule('*/5 * * * *', () => {
  surveyMonitor.updateSurveyStatuses();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});