/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { BankVerificationProvider } from '../../enums/bank-verification-provider.enum';
import { BankVerificationStatus } from '../../enums/bank-verification-status.enum';
import { VerificationProcessor } from './bank-verification.processor';
import { ProviderFactory } from './providers/provider-factory';
import { BankAccountVerification } from '../../models/bank-account-verification.model';
import { JobErrorHistory } from '../../models/job-error-histories.model';
import { JOBS } from '../../shared/constants/config';
import { LoggerUtil } from '../../shared/util/LoggerUtil';
import { messages } from '../../shared/constants/messages';
import { BadRequestException } from '@nestjs/common';

describe('VerificationProcessor', () => {
  let processor: VerificationProcessor;
  let mockVerificationModel: any;
  let mockJobErrorHistoryModel: any;
  let mockProviderFactory: any;
  let mockLogger: any;
  let mockJob: any;
  let mockProvider: any;
  let mockVerification: any;

  beforeEach(async () => {
    mockVerification = {
      id: 'b2f0a747-4ff8-496c-aa51-60fc6252d479',
      provider: BankVerificationProvider.RAZORPAY,
      save: jest.fn(),
    };

    mockJob = {
      data: { id: 'b2f0a747-4ff8-496c-aa51-60fc6252d479' },
    };

    mockProvider = {
      verify: jest
        .fn()
        .mockResolvedValue({ status: BankVerificationStatus.VERIFIED }),
    };

    mockVerificationModel = {
      findById: jest.fn().mockResolvedValue(mockVerification),
      update: jest.fn().mockResolvedValue([1]),
    };

    mockJobErrorHistoryModel = {
      create: jest.fn().mockResolvedValue({}),
    };

    mockProviderFactory = {
      getProvider: jest.fn().mockReturnValue(mockProvider),
    };

    mockLogger = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationProcessor,
        {
          provide: getModelToken(BankAccountVerification),
          useValue: mockVerificationModel,
        },
        {
          provide: getModelToken(JobErrorHistory),
          useValue: mockJobErrorHistoryModel,
        },
        {
          provide: ProviderFactory,
          useValue: mockProviderFactory,
        },
        {
          provide: LoggerUtil,
          useValue: mockLogger,
        },
      ],
    }).compile();

    processor = module.get<VerificationProcessor>(VerificationProcessor);
  });

  describe('performVerification', () => {
    it('should process verification successfully', async () => {
      await processor.performVerification(mockJob);

      expect(mockVerificationModel.findById).toHaveBeenCalledWith(
        mockVerification.id,
      );
      expect(mockProviderFactory.getProvider).toHaveBeenCalledWith(
        mockVerification.provider,
      );
      expect(mockProvider.verify).toHaveBeenCalledWith(mockVerification);
      expect(mockVerificationModel.update).toHaveBeenCalledWith(
        { status: BankVerificationStatus.VERIFIED },
        { where: { id: mockVerification.id } },
      );
    });

    it('should handle verification not found', async () => {
      mockVerificationModel.findById.mockRejectedValueOnce(
        new BadRequestException(messages.INVALID_ID),
      );

      await processor.performVerification(mockJob);

      expect(mockVerificationModel.findById).toHaveBeenCalledWith(
        mockVerification.id,
      );
      expect(mockProviderFactory.getProvider).not.toHaveBeenCalled();
    });

    it('should handle verification error and log it', async () => {
      const error = new Error('Verification failed');
      mockProvider.verify.mockRejectedValueOnce(error);

      await processor.performVerification(mockJob);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error verifying bank account',
        error.message,
      );
      expect(mockJobErrorHistoryModel.create).toHaveBeenCalledWith({
        associatedTableId: mockVerification.id,
        jobName: JOBS.PERFORM_VERIFICATION,
        error: error.message,
      });
    });

    it('should handle API error response', async () => {
      const error = {
        response: {
          data: { message: 'API Error' },
        },
        message: 'Request failed',
      };
      mockProvider.verify.mockRejectedValueOnce(error);

      await processor.performVerification(mockJob);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error verifying bank account',
        error.response.data,
      );
      expect(mockJobErrorHistoryModel.create).toHaveBeenCalledWith({
        associatedTableId: mockVerification.id,
        jobName: JOBS.PERFORM_VERIFICATION,
        error: JSON.stringify(error.response.data),
      });
    });
  });
});
