import { NextFunction, Request, Response } from 'express';
import { OpenApiService } from './openApi.service';
import healthCheckRepository from '../../repositories/healthCheck.repository';

class OpenApiController {
  async chatOne(req: Request, res: Response, next: NextFunction) {
    try {
      const healthCheckService = new OpenApiService(healthCheckRepository);

      const response = await healthCheckService.chatOne();
      return res.send(response);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

const openApiController = new OpenApiController();

export default openApiController;