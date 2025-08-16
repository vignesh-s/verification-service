/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { BankVerificationProvider } from '../../enums/bank-verification-provider.enum';
import { BankVerificationStatus } from '../../enums/bank-verification-status.enum';
import { BankVerificationsController } from './bank-verifications.controller';
import { BankVerificationsService } from './bank-verifications.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { BankVerificationResponseDto } from './dto/create-verification-response.dto';

describe('BankVerificationsController', () => {
  let controller: BankVerificationsController;
  let app: any;
  let service: jest.Mocked<BankVerificationsService>;

  const mockVerificationResponse: BankVerificationResponseDto = {
    id: '5436eda7-3928-4d9d-b4fa-09dcd0ad0bd0',
    accountHolderName: 'Test User',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    provider: BankVerificationProvider.RAZORPAY,
    status: BankVerificationStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const validCreateDto: CreateVerificationRequestDto = {
    accountHolderName: 'Test User',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    provider: BankVerificationProvider.RAZORPAY,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankVerificationsController],
      providers: [
        {
          provide: BankVerificationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BankVerificationsController>(
      BankVerificationsController,
    );
    service = module.get(BankVerificationsService);

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('createVerification', () => {
    it('should create a new bank verification with valid data', async () => {
      service.create.mockResolvedValue(mockVerificationResponse);
      const result = await controller.createVerification(validCreateDto);
      expect(service.create).toHaveBeenCalledWith(validCreateDto);
      expect(result).toEqual(mockVerificationResponse);
    });

    it('should throw BadRequestException when accountHolderName is empty', async () => {
      const invalidDto = { ...validCreateDto, accountHolderName: '' };
      const response = await request(app.getHttpServer())
        .post('/bank-verifications')
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'accountHolderName should not be empty',
      );
    });

    it('should throw BadRequestException when accountNumber is invalid', async () => {
      const invalidDtos = [
        { ...validCreateDto, accountNumber: '123' }, // Too short
        { ...validCreateDto, accountNumber: '1234567890123456789' }, // Too long
        { ...validCreateDto, accountNumber: '1234ABCD' }, // Contains letters
      ];

      for (const dto of invalidDtos) {
        const response = await request(app.getHttpServer())
          .post('/bank-verifications')
          .send(dto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          'Account number must be between 9 to 18 digits',
        );
      }
    });

    it('should throw BadRequestException when ifscCode is invalid', async () => {
      const invalidDtos = [
        { ...validCreateDto, ifscCode: 'HDFC001234' }, // Missing digit
        { ...validCreateDto, ifscCode: 'HDFC00012345' }, // Too long
        { ...validCreateDto, ifscCode: 'HDFC000123' }, // Too short
        { ...validCreateDto, ifscCode: 'HDFC000123a' }, // Lowercase letter
        { ...validCreateDto, ifscCode: '1234HDFC0001' }, // Wrong format
      ];

      for (const dto of invalidDtos) {
        const response = await request(app.getHttpServer())
          .post('/bank-verifications')
          .send(dto);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          'IFSC code must be a valid format (e.g., HDFC0001234)',
        );
      }
    });

    it('should throw BadRequestException when provider is invalid', async () => {
      const invalidDto = { ...validCreateDto, provider: 'INVALID_PROVIDER' };
      const response = await request(app.getHttpServer())
        .post('/bank-verifications')
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        `provider must be one of the following values: ` +
          Object.values(BankVerificationProvider).join(', '),
      );
    });
  });

  describe('getVerification', () => {
    it('should return a verification by id', async () => {
      const verificationId = mockVerificationResponse.id;
      service.get.mockResolvedValue(mockVerificationResponse);
      const result = await controller.getVerification(verificationId);
      expect(service.get).toHaveBeenCalledWith(verificationId);
      expect(result).toEqual(mockVerificationResponse);
    });
  });
});
