import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston/dist/winston.constants';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = new Date();
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(() => {
        this.logger.log({
          url: request.url,
          requestTime: now,
          responseTime: new Date(),
          status: response.statusCode,
          requestBody: request.body,
        });
      }),
      catchError((err) => {
        this.logger.error({
          url: request.url,
          requestTime: now,
          responseTime: new Date(),
          error: err,
          requestBody: request.body,
        });
        return throwError((): any => {
          return err;
        });
      }),
    );
  }
}
