"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_1 = require("./config/firebase");
const routes_1 = require("./routes");
const error_middleware_1 = require("./middleware/error.middleware");
const metrics_middleware_1 = require("./middleware/metrics.middleware");
const logger_1 = require("./utils/logger");
const metrics_1 = require("./monitoring/metrics");
dotenv_1.default.config();
(0, firebase_1.initializeFirebase)();
const app = (0, express_1.default)();
const port = process.env.API_PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(metrics_middleware_1.metricsMiddleware);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
// Routes
(0, routes_1.createRoutes)(app);
// Metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metrics_1.register.contentType);
        res.end(await metrics_1.register.metrics());
    }
    catch (err) {
        res.status(500).end(err);
    }
});
// Error handling
app.use(error_middleware_1.errorHandler);
// Start server
app.listen(port, () => {
    logger_1.logger.info(`Server running on port ${port}`);
    console.log(`Server is running on port ${port}`);
});
