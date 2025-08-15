import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BankAccountVerification } from '../../models/bank-account-verification.model';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { BankVerificationResponseDto } from './dto/create-verification-response.dto';

@Injectable()
export class BankVerificationsService {
  constructor(
    @InjectModel(BankAccountVerification)
    private readonly verificationModel: typeof BankAccountVerification,
  ) {}

  async create(
    createVerificationDto: CreateVerificationRequestDto,
  ): Promise<BankVerificationResponseDto> {
    const verification = await this.verificationModel.create({
      ...createVerificationDto,
    });
    return new BankVerificationResponseDto(verification);
  }

  async get(id: string): Promise<BankVerificationResponseDto> {
    const verification = await this.verificationModel.findById(id);
    return new BankVerificationResponseDto(verification);
  }
}
