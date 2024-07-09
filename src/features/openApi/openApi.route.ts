import { Router } from 'express';
import openApiController from './openApi.controller';

const openApiRouter: Router = Router();

openApiRouter.get('/chatModel', openApiController.chatOne);
openApiRouter.get('/promptTemplates', openApiController.promptTemplates);
openApiRouter.get('/outputParsers', openApiController.outputParsers);
openApiRouter.get('/retrievalChain', openApiController.retrievalChain);
openApiRouter.get('/chatHistory', openApiController.chatHistory);
openApiRouter.get('/agentOne', openApiController.agentOne);
openApiRouter.get('/chatMemory', openApiController.chatMemory);

export default openApiRouter;
