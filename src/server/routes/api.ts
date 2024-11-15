import express from 'express';
import { db } from '../config/firebase';
import { surveyMonitor } from '../services/surveyMonitor';

const router = express.Router();

// Get survey statistics
router.get('/stats', async (req, res) => {
  try {
    const plannedCount = (await db.collection('surveys')
      .where('status', '==', 'planned')
      .count()
      .get()).data().count;

    const activeCount = (await db.collection('surveys')
      .where('status', '==', 'active')
      .count()
      .get()).data().count;

    res.json({ planned: plannedCount, active: activeCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Submit survey response
router.post('/submit-survey', async (req, res) => {
  const { surveyId, employeeId, answers, followups } = req.body;

  try {
    const surveyDoc = await db.collection('surveys').doc(surveyId).get();
    
    if (!surveyDoc.exists) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = surveyDoc.data();
    
    if (survey.status !== 'active') {
      return res.status(400).json({ error: 'Survey is not active' });
    }

    const isRespondent = await db.collection('respondents')
      .where('surveyId', '==', surveyId)
      .where('employeeId', '==', employeeId)
      .get();

    if (isRespondent.empty) {
      return res.status(403).json({ error: 'Employee is not in respondents list' });
    }

    const answer = {
      surveyId,
      employeeId,
      companyId: survey.companyId,
      departmentId: survey.departmentId,
      answerCreated: new Date(),
      answerOptions: answers.join(','),
      answerFollowups: followups
    };

    await db.collection('answers').add(answer);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

// Update monitoring interval
router.post('/monitoring-interval', (req, res) => {
  const { interval } = req.body;
  const newInterval = surveyMonitor.setMonitoringInterval(interval);
  res.json({ interval: newInterval });
});

export default router;