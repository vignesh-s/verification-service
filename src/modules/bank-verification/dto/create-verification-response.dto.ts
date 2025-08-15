import { ApiProperty } from '@nestjs/swagger';
import { BankVerificationProvider } from '../../../enums/bank-verification-provider.enum';
import { BankVerificationStatus } from '../../../enums/bank-verification-status.enum';
import { BankAccountVerification } from '../../../models/bank-account-verification.model';

export class BankVerificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountHolderName: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  ifscCode: string;

  @ApiProperty()
  provider: BankVerificationProvider;

  @ApiProperty()
  status: BankVerificationStatus;

  @ApiProperty()
  failureReason: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(verification: BankAccountVerification) {
    this.id = verification.id;
    this.accountHolderName = verification.accountHolderName;
    this.accountNumber = verification.accountNumber;
    this.ifscCode = verification.ifscCode;
    this.provider = verification.provider;
    this.status = verification.status;
    this.failureReason = verification.failureReason;
    this.createdAt = verification.createdAt;
    this.updatedAt = verification.updatedAt;
  }
}
