import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import { APIRequest, APIResponse } from '../contracts';

const INTERNAL_ERROR = 500;

@Catch()
export class BasicExceptionFilter implements ExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<APIResponse>();
    const request = context.getRequest<APIRequest>();
    const status = exception?.getStatus
      ? exception?.getStatus()
      : INTERNAL_ERROR;

    response.status(status).json({
      error: exception.name,
      id: response.locals.authenticated,
      message: exception.message,
      path: request.url,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
