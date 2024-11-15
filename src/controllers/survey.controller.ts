import { Request, Response } from 'express';
import { SurveyService } from '../services/survey.service';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { Survey, SurveyStatus, SurveyResponse } from '../types/survey';

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

  getSurveyStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.surveyService.getSurveyStats();
      res.json(stats);
    } catch (error) {
      throw new AppError(500, 'Failed to get survey stats');
    }
  };

  submitResponse = async (req: Request, res: Response): Promise<void> => {
    try {
      const response: SurveyResponse = req.body;
      await this.surveyService.submitResponse(response);
      res.status(201).json({ message: 'Response submitted successfully' });
    } catch (error) {
      throw new AppError(400, 'Failed to submit response');
    }
  };

  updateInterval = async (req: Request, res: Response): Promise<void> => {
    try {
      const { seconds } = req.body;
      await this.surveyService.updateInterval(Number(seconds));
      res.json({ message: 'Update interval changed successfully' });
    } catch (error) {
      throw new AppError(400, 'Failed to update interval');
    }
  };
}