import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

export class SurveyMonitor {
  private monitoringInterval: number = 300000; // 5 minutes default

  async updateSurveyStatuses() {
    const now = Timestamp.now();
    
    // Update 'planned' to 'active'
    const plannedSurveys = await db.collection('surveys')
      .where('status', '==', 'planned')
      .where('startDate', '<=', now)
      .where('endDate', '>', now)
      .get();

    plannedSurveys.docs.forEach(async (doc) => {
      await doc.ref.update({ status: 'active' });
    });

    // Update 'active' to 'processing'
    const activeSurveys = await db.collection('surveys')
      .where('status', '==', 'active')
      .where('endDate', '<=', now)
      .get();

    activeSurveys.docs.forEach(async (doc) => {
      await doc.ref.update({ status: 'processing' });
    });
  }

  setMonitoringInterval(milliseconds: number) {
    this.monitoringInterval = milliseconds;
    return this.monitoringInterval;
  }

  getMonitoringInterval(): number {
    return this.monitoringInterval;
  }
}

export const surveyMonitor = new SurveyMonitor();