import { Router, Express } from "express";
import healthCheckRouter from "../features/healthCheck/healthCheck.route";
import openApiRouter from "../features/openApi/openApi.route";
import chatRouter from "../features/chat/chat.route";

export const setupRoutes = (app: Express): void => {
    const router: Router = Router();

    app.use('/api', router);
    router.use(healthCheckRouter);
    router.use(openApiRouter);
    router.use(chatRouter);
}