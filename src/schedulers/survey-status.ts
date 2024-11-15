import { db } from '../config/firebase';
import { SurveyStatus } from '../types/survey';
import { logger } from '../utils/logger';
import * as cron from 'node-cron';

let updateInterval = 30; // Default 30 seconds
let cronJob: cron.ScheduledTask | null = null;

export const getCurrentInterval = (): number => {
  return updateInterval;
};

export const setUpdateInterval = (seconds: number) => {
  updateInterval = seconds;
  setupScheduler(); // Restart scheduler with new interval
  logger.info(`Survey status update interval set to ${seconds} seconds`);
};

export const updateSurveyStatuses = async () => {
  const now = new Date();
  
  try {
    // Update planned to active
    const plannedSurveys = await db.collection('surveys')
      .where('status', '==', SurveyStatus.PLANNED)
      .where('startDate', '<=', now)
      .get();

    for (const doc of plannedSurveys.docs) {
      await doc.ref.update({
        status: SurveyStatus.ACTIVE,
        updatedAt: now
      });
    }

    // Update active to processing
    const activeSurveys = await db.collection('surveys')
      .where('status', '==', SurveyStatus.ACTIVE)
      .where('endDate', '<', now)
      .get();

    for (const doc of activeSurveys.docs) {
      await doc.ref.update({
        status: SurveyStatus.PROCESSING,
        updatedAt: now
      });
    }

    return {
      lastUpdate: now.toISOString(),
      nextUpdate: new Date(now.getTime() + updateInterval * 1000).toISOString()
    };
  } catch (error) {
    logger.error('Error updating survey statuses:', error);
    throw error;
  }
};

export const setupScheduler = () => {
  if (cronJob) {
    cronJob.stop();
  }
  
  cronJob = cron.schedule(`*/${updateInterval} * * * * *`, async () => {
    try {
      await updateSurveyStatuses();
    } catch (error) {
      logger.error('Scheduler error:', error);
    }
  });
};

// Initial setup
setupScheduler();