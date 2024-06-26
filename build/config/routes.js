"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
var express_1 = require("express");
var healthCheck_route_1 = __importDefault(require("../features/healthCheck/healthCheck.route"));
var setupRoutes = function (app) {
    var router = (0, express_1.Router)();
    app.use('/api', router);
    router.use(healthCheck_route_1.default);
};
exports.setupRoutes = setupRoutes;
