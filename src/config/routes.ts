import { Router, Express } from "express";
import healthCheckRouter from "../features/healthCheck/healthCheck.route";
import openApiRouter from "../features/openApi/openApi.route";

export const setupRoutes = (app: Express): void => {
    const router: Router = Router();

    app.use('/api', router);
    router.use(healthCheckRouter);
    router.use(openApiRouter);
}