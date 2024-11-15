export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  startDate: Date;
  endDate: Date;
  status: SurveyStatus;
  targetEmployees: string[];
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  surveyId: string;
  employeeId: string;
  answers: string[];
  comments?: string;
}

export interface SurveyStats {
  planned: number;
  active: number;
  lastUpdate: string;
  nextUpdate: string;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  RATING = 'RATING',
}

export enum SurveyStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}