import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JOBS } from '../shared/constants/config';
import { VerificationProcessor } from './bank-verification/bank-verification.processor';
import { ProviderFactory } from './bank-verification/providers/provider-factory';
import { RazorpayProvider } from './bank-verification/providers/razorpay.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: JOBS.BANK_VERIFICATION_PROCESSOR,
    }),
  ],
  providers: [VerificationProcessor, ProviderFactory, RazorpayProvider],
  exports: [BullModule],
})
export class JobsModule {}
