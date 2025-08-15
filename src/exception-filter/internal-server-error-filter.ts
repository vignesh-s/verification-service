import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

import { LoggerUtil } from '../shared/util/LoggerUtil';

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  constructor(public loggerUtil: LoggerUtil) {}

  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const r: any = exception.getResponse();
    const status = {
      statusCode: statusCode,
      message: r.message,
    };
    this.loggerUtil.error(exception, r.error);
    response.status(statusCode).json(status);
  }
}
