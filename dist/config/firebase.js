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
exports.initializeFirebase = exports.firebaseConfig = void 0;
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
exports.firebaseConfig = {
    apiKey: "AIzaSyBrshtX9K8EYYyewiPVcT7TZ05K-whJxNY",
    authDomain: "hroom-mpv-2f31e.firebaseapp.com",
    projectId: "hroom-mpv-2f31e",
    storageBucket: "hroom-mpv-2f31e.firebasestorage.app",
    messagingSenderId: "356587190634",
    appId: "1:356587190634:web:f7759be737658700830d13"
};
const initializeFirebase = () => {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!privateKey) {
            throw new Error('FIREBASE_PRIVATE_KEY is not set');
        }
        if (!process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('FIREBASE_CLIENT_EMAIL is not set');
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: exports.firebaseConfig.projectId,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
        logger_1.logger.info('Firebase initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize Firebase:', error);
        throw error;
    }
};
exports.initializeFirebase = initializeFirebase;
