"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSurvey = void 0;
const express_validator_1 = require("express-validator");
exports.validateSurvey = [
    (0, express_validator_1.body)('title').notEmpty().trim().isLength({ min: 3, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('questions').isArray({ min: 1 }),
    (0, express_validator_1.body)('questions.*.text').notEmpty().trim(),
    (0, express_validator_1.body)('questions.*.type').isIn(['MULTIPLE_CHOICE', 'TEXT', 'RATING']),
    (0, express_validator_1.body)('questions.*.required').isBoolean(),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('targetEmployees').isArray(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
