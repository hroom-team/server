"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        logger_1.logger.error(`${err.statusCode} - ${err.message}`);
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    logger_1.logger.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
};
exports.errorHandler = errorHandler;
