"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = void 0;
const metrics_1 = require("../monitoring/metrics");
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    const route = req.route?.path || req.path;
    res.on('finish', () => {
        const duration = Date.now() - start;
        metrics_1.httpRequestDuration
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration / 1000);
        metrics_1.httpRequestTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
    });
    next();
};
exports.metricsMiddleware = metricsMiddleware;
