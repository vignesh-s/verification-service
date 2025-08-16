import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bull';
import { BankAccountVerification } from '../../models/bank-account-verification.model';
import { JOBS } from '../../shared/constants/config';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { BankVerificationResponseDto } from './dto/create-verification-response.dto';

@Injectable()
export class BankVerificationsService {
  constructor(
    @InjectModel(BankAccountVerification)
    private readonly verificationModel: typeof BankAccountVerification,
    @InjectQueue(JOBS.BANK_VERIFICATION_PROCESSOR)
    private readonly verificationQueue: Queue,
  ) {}

  async create(
    createVerificationDto: CreateVerificationRequestDto,
  ): Promise<BankVerificationResponseDto> {
    const verification = await this.verificationModel.create({
      ...createVerificationDto,
    });
    await this.verificationQueue.add(JOBS.PERFORM_VERIFICATION, {
      id: verification.id,
    });
    return new BankVerificationResponseDto(verification);
  }

  async get(id: string): Promise<BankVerificationResponseDto> {
    const verification = await this.verificationModel.findById(id);
    return new BankVerificationResponseDto(verification);
  }
}
