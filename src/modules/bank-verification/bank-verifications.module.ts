import { Module } from '@nestjs/common';
import { JobsModule } from '../../jobs/jobs.module';
import { SharedModule } from '../../shared/shared.module';
import { BankVerificationsController } from './bank-verifications.controller';
import { BankVerificationsService } from './bank-verifications.service';

@Module({
  imports: [SharedModule, JobsModule],
  controllers: [BankVerificationsController],
  providers: [BankVerificationsService],
})
export class BankVerificationsModule {}
