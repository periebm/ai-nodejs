import { NextFunction, Request, Response } from 'express';
import { ChainService } from './chain.service';
import healthCheckRepository from '../../repositories/healthCheck.repository';
import { AgentService } from './agent.service';

class OpenApiController {
  public async chatOne(req: Request, res: Response, next: NextFunction) {
    try {
      const openApiService = new ChainService(healthCheckRepository);

      const response = await openApiService.chatOne();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async promptTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const chainService = new ChainService(healthCheckRepository);

      const response = await chainService.promptTemplates();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async outputParsers(req: Request, res: Response, next: NextFunction) {
    try {
      const chainService = new ChainService(healthCheckRepository);

      const response = await chainService.outputParsers();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async retrievalChain(req: Request, res: Response, next: NextFunction) {
    try {
      const chainService = new ChainService(healthCheckRepository);

      const response = await chainService.retrievalChain();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async chatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const chainService = new ChainService(healthCheckRepository);

      const response = await chainService.chatHistory();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async agentOne(req: Request, res: Response, next: NextFunction) {
    try {
      const agentService = new AgentService(healthCheckRepository);

      const response = await agentService.agentOne();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async chatMemory(req: Request, res: Response, next: NextFunction) {
    try {
      const chainService = new ChainService(healthCheckRepository);

      const response = await chainService.chatMemory();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const openApiController = new OpenApiController();

export default openApiController;