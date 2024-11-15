import { Request, Response } from 'express';
import { SurveyService } from '../services/survey.service';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { Survey, SurveyStatus } from '../types/survey';

export class SurveyController {
  private surveyService: SurveyService;

  constructor() {
    this.surveyService = new SurveyService();
  }

  createSurvey = async (req: Request, res: Response): Promise<void> => {
    try {
      const surveyData: Omit<Survey, 'id'> = req.body;
      const surveyId = await this.surveyService.createSurvey(surveyData);
      
      logger.info(`Survey created with ID: ${surveyId}`);
      res.status(201).json({ id: surveyId });
    } catch (error) {
      throw new AppError(400, 'Failed to create survey');
    }
  };

  getSurvey = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const survey = await this.surveyService.getSurvey(id);
    
    if (!survey) {
      throw new AppError(404, 'Survey not found');
    }
    
    res.json(survey);
  };

  updateSurveyStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!Object.values(SurveyStatus).includes(status)) {
      throw new AppError(400, 'Invalid status');
    }

    await this.surveyService.updateSurveyStatus(id, status);
    logger.info(`Survey ${id} status updated to ${status}`);
    res.status(200).json({ message: 'Status updated successfully' });
  };

  getActiveSurveys = async (req: Request, res: Response): Promise<void> => {
    const surveys = await this.surveyService.getActiveSurveys();
    res.json(surveys);
  };
}