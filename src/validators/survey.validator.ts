import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateSurvey = [
  body('title').notEmpty().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('questions').isArray({ min: 1 }),
  body('questions.*.text').notEmpty().trim(),
  body('questions.*.type').isIn(['MULTIPLE_CHOICE', 'TEXT', 'RATING']),
  body('questions.*.required').isBoolean(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('targetEmployees').isArray(),
  validateResults
];

export const validateResponse = [
  body('surveyId').notEmpty().trim(),
  body('employeeId').notEmpty().trim(),
  body('answers').isArray(),
  body('comments').optional().trim(),
  validateResults
];

function validateResults(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}