"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVar = void 0;
const getEnvVar = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};
exports.getEnvVar = getEnvVar;
