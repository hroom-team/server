"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTotal = exports.firebaseOperationDuration = exports.surveyResponsesTotal = exports.activeSurveysGauge = exports.httpRequestTotal = exports.httpRequestDuration = exports.register = void 0;
const prom_client_1 = require("prom-client");
exports.register = new prom_client_1.Registry();
// HTTP request metrics
exports.httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [exports.register],
});
exports.httpRequestTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.register],
});
// Survey metrics
exports.activeSurveysGauge = new prom_client_1.Gauge({
    name: 'active_surveys_total',
    help: 'Total number of active surveys',
    registers: [exports.register],
});
exports.surveyResponsesTotal = new prom_client_1.Counter({
    name: 'survey_responses_total',
    help: 'Total number of survey responses',
    labelNames: ['survey_id'],
    registers: [exports.register],
});
// Firebase operation metrics
exports.firebaseOperationDuration = new prom_client_1.Histogram({
    name: 'firebase_operation_duration_seconds',
    help: 'Duration of Firebase operations in seconds',
    labelNames: ['operation'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [exports.register],
});
// Error metrics
exports.errorTotal = new prom_client_1.Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type'],
    registers: [exports.register],
});
