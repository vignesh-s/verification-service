import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { HandleError } from '../../decorator/handleError.decorator';
import { BankAccountVerification } from '../../models/bank-account-verification.model';
import { JobErrorHistory } from '../../models/job-error-histories.model';
import { JOBS } from '../../shared/constants/config';
import { LoggerUtil } from '../../shared/util/LoggerUtil';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { BankVerificationResponseDto } from './dto/create-verification-response.dto';

@Injectable()
export class BankVerificationsService {
  constructor(
    @InjectModel(BankAccountVerification)
    private readonly verificationModel: typeof BankAccountVerification,
    @InjectModel(JobErrorHistory)
    private readonly jobErrorHistoryModel: typeof JobErrorHistory,
    @InjectQueue(JOBS.BANK_VERIFICATION_PROCESSOR)
    private readonly verificationQueue: Queue,
    private readonly logger: LoggerUtil,
  ) {}

  @HandleError()
  async create(
    createVerificationDto: CreateVerificationRequestDto,
  ): Promise<BankVerificationResponseDto> {
    const verification = await this.verificationModel.create({
      ...createVerificationDto,
    });
    try {
      await this.verificationQueue.add(JOBS.PERFORM_VERIFICATION, {
        id: verification.id,
      });
    } catch (error) {
      this.logger.error(
        'Error adding verification to queue',
        error.response?.data || error.message,
      );
      await this.jobErrorHistoryModel.create({
        associatedTableId: verification.id,
        jobName: JOBS.PERFORM_VERIFICATION,
        error: JSON.stringify(error),
      });
    }
    return new BankVerificationResponseDto(verification);
  }

  @HandleError()
  async get(id: string): Promise<BankVerificationResponseDto> {
    const verification = await this.verificationModel.findById(id);
    return new BankVerificationResponseDto(verification);
  }
}
