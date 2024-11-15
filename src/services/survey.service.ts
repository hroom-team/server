import { db } from '../config/firebase';
import { Survey, SurveyStatus, SurveyResponse, SurveyStats } from '../types/survey';
import { firebaseOperationDuration, activeSurveysGauge } from '../monitoring/metrics';
import { updateSurveyStatuses, setUpdateInterval, getCurrentInterval } from '../schedulers/survey-status';

export class SurveyService {
  async createSurvey(survey: Omit<Survey, 'id'>): Promise<string> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'createSurvey' });
    try {
      const docRef = await db.collection('surveys').add({
        ...survey,
        createdAt: new Date(),
      });
      return docRef.id;
    } finally {
      timer();
    }
  }

  async getSurvey(id: string): Promise<Survey | null> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'getSurvey' });
    try {
      const doc = await db.collection('surveys').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } as Survey : null;
    } finally {
      timer();
    }
  }

  async submitResponse(response: SurveyResponse): Promise<void> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'submitResponse' });
    try {
      await db.collection('survey_responses').add({
        ...response,
        createdAt: new Date()
      });
    } finally {
      timer();
    }
  }

  async getSurveyStats(): Promise<SurveyStats> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'getSurveyStats' });
    try {
      const [plannedSnapshot, activeSnapshot] = await Promise.all([
        db.collection('surveys')
          .where('status', '==', SurveyStatus.PLANNED)
          .get(),
        db.collection('surveys')
          .where('status', '==', SurveyStatus.ACTIVE)
          .get()
      ]);

      const { lastUpdate, nextUpdate } = await updateSurveyStatuses();

      return {
        planned: plannedSnapshot.size,
        active: activeSnapshot.size,
        lastUpdate,
        nextUpdate
      };
    } finally {
      timer();
    }
  }

  async getCurrentInterval(): Promise<number> {
    return getCurrentInterval();
  }

  async updateInterval(seconds: number): Promise<void> {
    setUpdateInterval(seconds);
  }
}