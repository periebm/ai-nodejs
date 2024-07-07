import { Router } from "express";
import healthCheckController from "./openApi.controller";

const openApiRouter: Router = Router();

openApiRouter.get('/chatModel', healthCheckController.chatOne )

export default openApiRouter;