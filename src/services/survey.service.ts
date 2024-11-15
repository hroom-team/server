import * as admin from 'firebase-admin';
import { Survey, SurveyStatus } from '../types/survey';
import { firebaseOperationDuration, activeSurveysGauge } from '../monitoring/metrics';

export class SurveyService {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  async createSurvey(survey: Omit<Survey, 'id'>): Promise<string> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'createSurvey' });
    try {
      const docRef = await this.db.collection('surveys').add({
        ...survey,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } finally {
      timer();
    }
  }

  async getSurvey(id: string): Promise<Survey | null> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'getSurvey' });
    try {
      const doc = await this.db.collection('surveys').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } as Survey : null;
    } finally {
      timer();
    }
  }

  async updateSurveyStatus(id: string, status: SurveyStatus): Promise<void> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'updateSurveyStatus' });
    try {
      await this.db.collection('surveys').doc(id).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } finally {
      timer();
    }
  }

  async getActiveSurveys(): Promise<Survey[]> {
    const timer = firebaseOperationDuration.startTimer({ operation: 'getActiveSurveys' });
    try {
      const snapshot = await this.db.collection('surveys')
        .where('status', '==', SurveyStatus.ACTIVE)
        .where('endDate', '>', new Date())
        .get();

      const surveys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Survey));

      activeSurveysGauge.set(surveys.length);
      return surveys;
    } finally {
      timer();
    }
  }
}