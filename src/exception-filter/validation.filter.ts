import { ExceptionFilter, ArgumentsHost, Catch } from '@nestjs/common';
import { ValidationException } from './validation.exception';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return response.status(400).json({
      statusCode: 400,
      message: exception.validationErrors,
    });
  }
}
