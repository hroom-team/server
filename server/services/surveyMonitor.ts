import { Firestore } from 'firebase-admin/firestore';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { isBefore, isAfter } from 'date-fns';

export class SurveyMonitor {
  private db: Firestore;
  private timeZone: string;
  private monitoringInterval: number;
  private intervalId?: NodeJS.Timeout;

  constructor(db: Firestore, timeZone: string = 'Europe/Moscow', interval: number = 300000) {
    this.db = db;
    this.timeZone = timeZone;
    this.monitoringInterval = interval;
  }

  async checkAndUpdateSurveyStatuses(): Promise<void> {
    const now = utcToZonedTime(new Date(), this.timeZone);
    console.log(`[SurveyMonitor] Running status check at ${now.toISOString()}`);

    try {
      // Update planned surveys to active if needed
      const plannedSnapshot = await this.db
        .collection('surveys')
        .where('status', '==', 'planned')
        .get();

      const plannedUpdates = plannedSnapshot.docs.map(async (doc) => {
        const survey = doc.data();
        const startDate = utcToZonedTime(new Date(survey.startDate), this.timeZone);
        const endDate = utcToZonedTime(new Date(survey.endDate), this.timeZone);

        if (isAfter(now, startDate) && isBefore(now, endDate)) {
          await doc.ref.update({ 
            status: 'active',
            updatedAt: now.toISOString()
          });
          console.log(`[SurveyMonitor] Survey ${doc.id} status updated to active`);
        }
      });

      // Update active surveys to processing if needed
      const activeSnapshot = await this.db
        .collection('surveys')
        .where('status', '==', 'active')
        .get();

      const activeUpdates = activeSnapshot.docs.map(async (doc) => {
        const survey = doc.data();
        const endDate = utcToZonedTime(new Date(survey.endDate), this.timeZone);

        if (isAfter(now, endDate)) {
          await doc.ref.update({ 
            status: 'processing',
            updatedAt: now.toISOString()
          });
          console.log(`[SurveyMonitor] Survey ${doc.id} status updated to processing`);
        }
      });

      await Promise.all([...plannedUpdates, ...activeUpdates]);
    } catch (error) {
      console.error('[SurveyMonitor] Error updating survey statuses:', error);
    }
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }
    
    // Run immediately on start
    this.checkAndUpdateSurveyStatuses();
    
    // Schedule regular checks
    this.intervalId = setInterval(() => {
      this.checkAndUpdateSurveyStatuses();
    }, this.monitoringInterval);

    console.log(`[SurveyMonitor] Started monitoring with interval ${this.monitoringInterval}ms`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('[SurveyMonitor] Stopped monitoring');
    }
  }

  updateInterval(newInterval: number): void {
    this.monitoringInterval = newInterval;
    this.start(); // Restart with new interval
    console.log(`[SurveyMonitor] Updated monitoring interval to ${newInterval}ms`);
  }
}