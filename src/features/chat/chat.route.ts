import { Router } from 'express';
import chatController from './chat.controller';

const chatRouter: Router = Router();

chatRouter.post('/chatOne', chatController.chat1);

export default chatRouter;
