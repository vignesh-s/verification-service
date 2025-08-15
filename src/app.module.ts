import { Module } from '@nestjs/common';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { DatabaseModule } from './database/database.module';
import { BankVerificationsModule } from './modules/bank-verification/bank-verifications.module';

@Module({
  imports: [
    DatabaseModule,
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          filename: 'logs/service-log.log',
          maxsize: 5242880,
          maxFiles: 10,
        }),
      ],
    }),
    BankVerificationsModule,
  ],
})
export class AppModule {
  constructor() {}
}
