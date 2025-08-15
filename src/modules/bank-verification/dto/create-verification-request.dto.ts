import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { BankVerificationProvider } from '../../../enums/bank-verification-provider.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVerificationRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{9,18}$/, {
    message: 'Account number must be between 9 to 18 digits',
  })
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]{4}\d{7}$/, {
    message: 'IFSC code must be a valid format (e.g., HDFC0001234)',
  })
  ifscCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(BankVerificationProvider)
  provider?: BankVerificationProvider;
}
