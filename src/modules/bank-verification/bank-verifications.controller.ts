import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BankVerificationsService } from './bank-verifications.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { BankVerificationResponseDto } from './dto/create-verification-response.dto';

@ApiTags('Bank Verifications')
@Controller('bank-verifications')
export class BankVerificationsController {
  constructor(private readonly service: BankVerificationsService) {}

  @Post()
  @ApiOkResponse({
    description: 'Verification created successfully',
    type: BankVerificationResponseDto,
  })
  @ApiOperation({
    summary: 'This endpoint creates a bank verification',
  })
  async createVerification(
    @Body() createVerificationDto: CreateVerificationRequestDto,
  ): Promise<BankVerificationResponseDto> {
    return this.service.create(createVerificationDto);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Verification retrieved successfully',
    type: BankVerificationResponseDto,
  })
  @ApiOperation({
    summary: 'This endpoint retrieves a bank verification',
  })
  async getVerification(
    @Param('id') id: string,
  ): Promise<BankVerificationResponseDto> {
    return this.service.get(id);
  }
}
