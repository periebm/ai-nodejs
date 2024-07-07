import { Router } from 'express';
import openApiController from './openApi.controller';

const openApiRouter: Router = Router();

openApiRouter.get('/chatModel', openApiController.chatOne);
openApiRouter.get('/promptTemplates', openApiController.promptTemplates);
openApiRouter.get('/outputParsers', openApiController.outputParsers);
openApiRouter.get('/retrievalChain', openApiController.retrievalChain);
openApiRouter.get('/chatHistory', openApiController.chatHistory);

export default openApiRouter;
