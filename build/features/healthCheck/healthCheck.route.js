"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var HealthCheck_controller_1 = __importDefault(require("./HealthCheck.controller"));
var healthCheckRouter = (0, express_1.Router)();
healthCheckRouter.get('/health', HealthCheck_controller_1.default.checkHealth);
exports.default = healthCheckRouter;
