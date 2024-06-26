import { Router, Express } from "express";
import healthCheckRouter from "../features/healthCheck/healthCheck.route";

export const setupRoutes = (app: Express): void => {
    const router: Router = Router();

    app.use('/api', router);
    router.use(healthCheckRouter);
}