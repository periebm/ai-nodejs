import { NextFunction, Response, Request } from 'express';
import { CustomError, } from '../errors/Custom.error';
import { HttpStatusCode, isAxiosError } from 'axios';

class ErrorHandler {
  async handleError(err: any, req: Request,res: Response, next: NextFunction) {
    if (err instanceof CustomError) {

      const responseError = {
        success: false,
        statusCode: err.statusCode,
        message: err.message,
      }

      return res.status(err.statusCode).send(responseError);
    }
    
    if(isAxiosError(err)) {
      const responseError = {
        success: false,
        statusCode: err.response?.status || err.status || 400,
        message: err.message,
      }

      return res.status(responseError.statusCode).send(responseError);
    }

    return res.status(HttpStatusCode.BadRequest).send({
      success: false,
      statusCode: HttpStatusCode.BadRequest,
      message: 'Bad Request' 
    });
  }
}

const errorHandler = new ErrorHandler();

export default errorHandler;
