"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyService = void 0;
const admin = __importStar(require("firebase-admin"));
const survey_1 = require("../types/survey");
const metrics_1 = require("../monitoring/metrics");
class SurveyService {
    constructor() {
        this.db = admin.firestore();
    }
    async createSurvey(survey) {
        const timer = metrics_1.firebaseOperationDuration.startTimer({ operation: 'createSurvey' });
        try {
            const docRef = await this.db.collection('surveys').add({
                ...survey,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return docRef.id;
        }
        finally {
            timer();
        }
    }
    async getSurvey(id) {
        const timer = metrics_1.firebaseOperationDuration.startTimer({ operation: 'getSurvey' });
        try {
            const doc = await this.db.collection('surveys').doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        }
        finally {
            timer();
        }
    }
    async updateSurveyStatus(id, status) {
        const timer = metrics_1.firebaseOperationDuration.startTimer({ operation: 'updateSurveyStatus' });
        try {
            await this.db.collection('surveys').doc(id).update({
                status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        finally {
            timer();
        }
    }
    async getActiveSurveys() {
        const timer = metrics_1.firebaseOperationDuration.startTimer({ operation: 'getActiveSurveys' });
        try {
            const snapshot = await this.db.collection('surveys')
                .where('status', '==', survey_1.SurveyStatus.ACTIVE)
                .where('endDate', '>', new Date())
                .get();
            const surveys = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            metrics_1.activeSurveysGauge.set(surveys.length);
            return surveys;
        }
        finally {
            timer();
        }
    }
}
exports.SurveyService = SurveyService;
