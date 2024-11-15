import { Express } from 'express';
import surveyRoutes from './survey.routes';

export const createRoutes = (app: Express): void => {
  app.use('/api/v1/surveys', surveyRoutes);
};