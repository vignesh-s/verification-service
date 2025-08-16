/* eslint-disable @typescript-eslint/unbound-method */
import { getQueueToken } from '@nestjs/bull';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { BankVerificationProvider } from '../../enums/bank-verification-provider.enum';
import { BankVerificationStatus } from '../../enums/bank-verification-status.enum';
import { BankAccountVerification } from '../../models/bank-account-verification.model';
import { JOBS } from '../../shared/constants/config';
import { BankVerificationsService } from './bank-verifications.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { BankVerificationResponseDto } from './dto/create-verification-response.dto';
import { LoggerUtil } from '../../shared/util/LoggerUtil';
import { JobErrorHistory } from '../../models/job-error-histories.model';

describe('BankVerificationsService', () => {
  let service: BankVerificationsService;
  let mockVerificationModel: typeof BankAccountVerification;
  let mockQueue: jest.Mocked<Queue>;
  let mockJobErrorHistoryModel: typeof JobErrorHistory;

  const mockVerification = {
    id: '5436eda7-3928-4d9d-b4fa-09dcd0ad0bd0',
    accountHolderName: 'Test User',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    provider: BankVerificationProvider.RAZORPAY,
    status: BankVerificationStatus.PENDING,
    save: jest.fn(),
    destroy: jest.fn(),
  };

  const mockCreateDto: CreateVerificationRequestDto = {
    accountHolderName: 'Test User',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    provider: BankVerificationProvider.RAZORPAY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankVerificationsService,
        {
          provide: getModelToken(BankAccountVerification),
          useValue: {
            create: jest
              .fn()
              .mockImplementation(() => Promise.resolve(mockVerification)),
            findById: jest
              .fn()
              .mockImplementation((id) =>
                Promise.resolve(
                  id === mockVerification.id ? mockVerification : null,
                ),
              ),
          },
        },
        {
          provide: getModelToken(JobErrorHistory),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getQueueToken(JOBS.BANK_VERIFICATION_PROCESSOR),
          useValue: {
            add: jest.fn().mockResolvedValue({ id: 'job-id' }),
          },
        },
        {
          provide: LoggerUtil,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BankVerificationsService>(BankVerificationsService);
    mockVerificationModel = module.get(getModelToken(BankAccountVerification));
    mockJobErrorHistoryModel = module.get(getModelToken(JobErrorHistory));
    mockQueue = module.get(getQueueToken(JOBS.BANK_VERIFICATION_PROCESSOR));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new verification and add to queue', async () => {
      const result = await service.create(mockCreateDto);

      expect(mockVerificationModel.create).toHaveBeenCalledWith(mockCreateDto);
      expect(mockQueue.add).toHaveBeenCalledWith(JOBS.PERFORM_VERIFICATION, {
        id: mockVerification.id,
      });
      expect(result).toBeInstanceOf(BankVerificationResponseDto);
      expect(result.id).toBe(mockVerification.id);
    });

    it('should handle database errors during creation', async () => {
      const error = new Error('Internal server error');
      mockVerificationModel.create = jest.fn().mockRejectedValue(error);

      await expect(service.create(mockCreateDto)).rejects.toThrow(error);
    });

    it('should handle queue errors gracefully', async () => {
      const error = new Error('Queue error');
      mockQueue.add = jest.fn().mockRejectedValue(error);

      // The service should still resolve even if queue fails
      await expect(service.create(mockCreateDto)).resolves.toBeDefined();
      expect(mockJobErrorHistoryModel.create).toHaveBeenCalledWith({
        associatedTableId: mockVerification.id,
        jobName: JOBS.PERFORM_VERIFICATION,
        error: JSON.stringify(error),
      });
    });
  });

  describe('get', () => {
    it('should return a verification by id', async () => {
      const result = await service.get(mockVerification.id);

      expect(mockVerificationModel.findById).toHaveBeenCalledWith(
        mockVerification.id,
      );
      expect(result).toBeInstanceOf(BankVerificationResponseDto);
      expect(result.id).toBe(mockVerification.id);
    });
  });
});
