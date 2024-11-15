"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyController = void 0;
const survey_service_1 = require("../services/survey.service");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../utils/logger");
const survey_1 = require("../types/survey");
class SurveyController {
    constructor() {
        this.createSurvey = async (req, res) => {
            try {
                const surveyData = req.body;
                const surveyId = await this.surveyService.createSurvey(surveyData);
                logger_1.logger.info(`Survey created with ID: ${surveyId}`);
                res.status(201).json({ id: surveyId });
            }
            catch (error) {
                throw new error_middleware_1.AppError(400, 'Failed to create survey');
            }
        };
        this.getSurvey = async (req, res) => {
            const { id } = req.params;
            const survey = await this.surveyService.getSurvey(id);
            if (!survey) {
                throw new error_middleware_1.AppError(404, 'Survey not found');
            }
            res.json(survey);
        };
        this.updateSurveyStatus = async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            if (!Object.values(survey_1.SurveyStatus).includes(status)) {
                throw new error_middleware_1.AppError(400, 'Invalid status');
            }
            await this.surveyService.updateSurveyStatus(id, status);
            logger_1.logger.info(`Survey ${id} status updated to ${status}`);
            res.status(200).json({ message: 'Status updated successfully' });
        };
        this.getActiveSurveys = async (req, res) => {
            const surveys = await this.surveyService.getActiveSurveys();
            res.json(surveys);
        };
        this.surveyService = new survey_service_1.SurveyService();
    }
}
exports.SurveyController = SurveyController;
