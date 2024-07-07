import { Router } from 'express';
import healthCheckController from './openApi.controller';

const openApiRouter: Router = Router();

openApiRouter.get('/chatModel', healthCheckController.chatOne);
openApiRouter.get('/promptTemplates', healthCheckController.promptTemplates);
openApiRouter.get('/outputParsers', healthCheckController.outputParsers);

export default openApiRouter;
