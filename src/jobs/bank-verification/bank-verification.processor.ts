import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/sequelize';
import { Job } from 'bull';
import { BankAccountVerification } from '../../models/bank-account-verification.model';
import { JobErrorHistory } from '../../models/job-error-histories.model';
import { JOBS } from '../../shared/constants/config';
import { LoggerUtil } from '../../shared/util/LoggerUtil';
import { ProviderFactory } from './providers/provider-factory';

@Processor(JOBS.BANK_VERIFICATION_PROCESSOR)
export class VerificationProcessor {
  constructor(
    @InjectModel(BankAccountVerification)
    private readonly verificationModel: typeof BankAccountVerification,
    @InjectModel(JobErrorHistory)
    private readonly jobErrorHistoryModel: typeof JobErrorHistory,
    private readonly providerFactory: ProviderFactory,
    private readonly logger: LoggerUtil,
  ) {}

  @Process(JOBS.PERFORM_VERIFICATION)
  async performVerification(job: Job<{ id: string }>) {
    try {
      const verification = await this.verificationModel.findById(job.data.id);
      const provider = this.providerFactory.getProvider(verification.provider);
      const result = await provider.verify(verification);
      await this.verificationModel.update(
        {
          status: result.status,
        },
        { where: { id: job.data.id } },
      );
    } catch (error) {
      this.logger.error(
        'Error verifying bank account',
        error.response?.data || error.message,
      );
      await this.jobErrorHistoryModel.create({
        associatedTableId: job.data.id,
        jobName: JOBS.PERFORM_VERIFICATION,
        error: JSON.stringify(error.response?.data) || error.message,
      });
    }
  }
}
