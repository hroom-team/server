"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyStatus = exports.QuestionType = void 0;
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["TEXT"] = "TEXT";
    QuestionType["RATING"] = "RATING";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var SurveyStatus;
(function (SurveyStatus) {
    SurveyStatus["DRAFT"] = "DRAFT";
    SurveyStatus["ACTIVE"] = "ACTIVE";
    SurveyStatus["COMPLETED"] = "COMPLETED";
    SurveyStatus["CANCELLED"] = "CANCELLED";
})(SurveyStatus || (exports.SurveyStatus = SurveyStatus = {}));
