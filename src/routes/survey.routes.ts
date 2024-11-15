import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSurvey, validateResponse } from '../validators/survey.validator';

const router = Router();
const surveyController = new SurveyController();

router.use(authMiddleware);

router.post('/', validateSurvey, surveyController.createSurvey);
router.get('/stats', surveyController.getSurveyStats);
router.post('/response', validateResponse, surveyController.submitResponse);
router.post('/update-interval', surveyController.updateInterval);

export default router;