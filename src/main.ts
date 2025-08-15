import { ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import compression from 'compression';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston/dist/winston.constants';

import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './exception-filter/bad-request.filter';
import { InternalServerErrorExceptionFilter } from './exception-filter/internal-server-error-filter';
import { ValidationException } from './exception-filter/validation.exception';
import { ValidationFilter } from './exception-filter/validation.filter';
import { LoggingInterceptor } from './shared/services/logger.interceptor';
import { LoggerUtil } from './shared/util/LoggerUtil';
import { setupSwagger } from './swagger';

dotenv.config({
  path: `.env`,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
    rawBody: true,
  });
  app.setGlobalPrefix('api');
  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  const logger = await app.resolve(LoggerUtil);
  app.useLogger(logger);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(compression());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(morgan('combined'));
  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new BadRequestExceptionFilter(reflector),
    new ValidationFilter(),
    new InternalServerErrorExceptionFilter(logger),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      dismissDefaultMessages: false,
      validationError: {
        target: false,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = {};
        errors.forEach((error) => {
          if (error.constraints) {
            messages[error.property] = Object.values(error.constraints)[0];
          } else if (error.children) {
            const child = error.children[0];
            if (child.children) {
              child.children.forEach((grandChild) => {
                if (grandChild.constraints) {
                  messages[grandChild.property] = Object.values(
                    grandChild.constraints,
                  )[0];
                }
              });
            }
          } else {
            messages[error.property] = error.value;
          }
        });
        return new ValidationException(messages);
      },
    }),
  );

  console.log('NODE_APP_INSTANCE', process.env.NODE_APP_INSTANCE);
  console.error(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'production') {
    app.useGlobalInterceptors(
      new LoggingInterceptor(app.get(WINSTON_MODULE_NEST_PROVIDER)),
    );
  }
  app.enableCors();
  const port = process.env.PORT || 3000;

  const expressApp: any = app.getHttpAdapter().getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  expressApp.set('trust proxy', true);
  console.log('Starting application on port ', port);
  await app.listen(port);
}

void bootstrap();
