import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Survey metrics
export const activeSurveysGauge = new Gauge({
  name: 'active_surveys_total',
  help: 'Total number of active surveys',
  registers: [register],
});

export const surveyResponsesTotal = new Counter({
  name: 'survey_responses_total',
  help: 'Total number of survey responses',
  labelNames: ['survey_id'],
  registers: [register],
});

// Firebase operation metrics
export const firebaseOperationDuration = new Histogram({
  name: 'firebase_operation_duration_seconds',
  help: 'Duration of Firebase operations in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Error metrics
export const errorTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type'],
  registers: [register],
});