import { db } from '../config/firebase';
import { SurveyStatus } from '../types/survey';
import { logger } from '../utils/logger';
import * as cron from 'node-cron';

let updateInterval = '*/30 * * * * *'; // Default 30 seconds
let cronJob: cron.ScheduledTask | null = null;

export const setUpdateInterval = (seconds: number) => {
  updateInterval = `*/${seconds} * * * * *`;
  setupScheduler(); // Restart scheduler with new interval
  logger.info(`Survey status update interval set to ${seconds} seconds`);
};

export const updateSurveyStatuses = async () => {
  const now = new Date();
  const batch = db.batch();
  let updatedCount = 0;
  
  try {
    // Update planned to active
    const plannedSnapshot = await db.collection('surveys')
      .where('status', '==', SurveyStatus.PLANNED)
      .where('startDate', '<=', now)
      .get();

    plannedSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: SurveyStatus.ACTIVE,
        updatedAt: now
      });
      updatedCount++;
    });

    // Update active to processing
    const activeSnapshot = await db.collection('surveys')
      .where('status', '==', SurveyStatus.ACTIVE)
      .where('endDate', '<', now)
      .get();

    activeSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: SurveyStatus.PROCESSING,
        updatedAt: now
      });
      updatedCount++;
    });

    if (updatedCount > 0) {
      await batch.commit();
      logger.info(`Updated ${updatedCount} survey statuses`);
    }

    return {
      lastUpdate: now.toISOString(),
      nextUpdate: new Date(now.getTime() + parseInt(updateInterval) * 1000).toISOString()
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
  
  cronJob = cron.schedule(updateInterval, async () => {
    try {
      await updateSurveyStatuses();
    } catch (error) {
      logger.error('Scheduler error:', error);
    }
  });
};

// Initial setup
setupScheduler();