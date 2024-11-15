"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = void 0;
const survey_routes_1 = __importDefault(require("./survey.routes"));
const createRoutes = (app) => {
    app.use('/api/v1/surveys', survey_routes_1.default);
};
exports.createRoutes = createRoutes;
