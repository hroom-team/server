import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSurvey } from '../validators/survey.validator';

const router = Router();
const surveyController = new SurveyController();

router.use(authMiddleware);

router.post('/', validateSurvey, surveyController.createSurvey);
router.get('/:id', surveyController.getSurvey);
router.patch('/:id/status', surveyController.updateSurveyStatus);
router.get('/active', surveyController.getActiveSurveys);

export default router;