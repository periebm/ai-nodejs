import { NextFunction, Request, Response } from 'express';
import { OpenApiService } from './openApi.service';
import healthCheckRepository from '../../repositories/healthCheck.repository';

class OpenApiController {
  public async chatOne(req: Request, res: Response, next: NextFunction) {
    try {
      const openApiService = new OpenApiService(healthCheckRepository);

      const response = await openApiService.chatOne();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async promptTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const openApiService = new OpenApiService(healthCheckRepository);

      const response = await openApiService.promptTemplates();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  public async outputParsers(req: Request, res: Response, next: NextFunction) {
    try {
      const openApiService = new OpenApiService(healthCheckRepository);

      const response = await openApiService.promptTemplates();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const openApiController = new OpenApiController();

export default openApiController;