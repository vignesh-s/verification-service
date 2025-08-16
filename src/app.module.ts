import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { DatabaseModule } from './database/database.module';
import { JobsModule } from './jobs/jobs.module';
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
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    BankVerificationsModule,
    JobsModule,
  ],
})
export class AppModule {
  constructor() {}
}
