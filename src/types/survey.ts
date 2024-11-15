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

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  RATING = 'RATING',
}

export enum SurveyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}