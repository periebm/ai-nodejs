import { NextFunction, Request, Response } from 'express';
import healthCheckRepository from '../../repositories/healthCheck.repository';
import { ChatService } from './chat.service';

class ChatController {
  public async chat1(req: Request, res: Response, next: NextFunction) {
    const { message } = req.body;

    try {
      const chainService = new ChatService(healthCheckRepository);

      const response = await chainService.chatMemory(message);
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const chatController = new ChatController();

export default chatController;
