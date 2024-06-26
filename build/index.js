"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
require("./config/config");
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
var routes_1 = require("./config/routes");
var error_handler_1 = __importDefault(require("./middlewares/error.handler"));
var config_1 = require("./config/config");
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
(0, routes_1.setupRoutes)(app);
app.use(error_handler_1.default.handleError);
var PORT = config_1.envConfig.port || 3005;
app.listen(PORT, function () {
    console.log("Rota do A\u00E7o: Up and Running in [".concat(config_1.envConfig.env, "] mode on port [").concat(PORT, "]"));
});
process.on('uncaughtException', function (err) {
    console.log("Uncaught Exception: ".concat(err.message));
    process.exit(1);
});
process.on('unhandledRejection', function (reason, promise) {
    console.log('Unhandled rejection at ', promise, "reason: ".concat(reason));
    process.exit(1);
});
