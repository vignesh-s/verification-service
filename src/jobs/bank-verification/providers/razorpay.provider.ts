import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { BankVerificationStatus } from '../../../enums/bank-verification-status.enum';
import { BankAccountVerification } from '../../../models/bank-account-verification.model';
import { ConfigService } from '../../../shared/services/config.service';
import { IVerificationProvider } from './provider.interface';

@Injectable()
export class RazorpayProvider implements IVerificationProvider {
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const { keyId, keySecret, baseURL } = this.configService.razorpayConfig;

    if (!keyId || !keySecret) {
      throw new Error(
        'Missing Razorpay API credentials in environment variables',
      );
    }

    this.axiosInstance = axios.create({
      baseURL,
      auth: {
        username: keyId,
        password: keySecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async verify(
    verification: BankAccountVerification,
  ): Promise<{ status: string }> {
    const contactId = await this.createContact(verification.accountHolderName);
    const fundAccountId = await this.createFundAccount(verification, contactId);
    const validationId = await this.validateAccount(fundAccountId);
    return this.fetchValidation(validationId);
  }

  async createContact(accountHolderName: string) {
    const payload = {
      name: accountHolderName,
      type: 'customer',
    };

    const response = await this.axiosInstance.post('/contacts', payload);
    return response.data.id as string;
  }

  async createFundAccount(
    verification: BankAccountVerification,
    contactId: string,
  ): Promise<string> {
    const payload = {
      contact_id: contactId,
      account_type: 'bank_account',
      bank_account: {
        name: verification.accountHolderName,
        ifsc: verification.ifscCode,
        account_number: verification.accountNumber,
      },
    };

    const response = await this.axiosInstance.post('/fund_accounts', payload);
    return response.data.id as string;
  }

  async validateAccount(fundAccountId: string): Promise<string> {
    const payload = {
      account_number: this.configService.razorpayConfig.sourceAccountNumber,
      fund_account: {
        id: fundAccountId,
      },
      amount: 100,
      currency: 'INR',
    };

    const response = await this.axiosInstance.post(
      '/fund_accounts/validations',
      payload,
    );
    return response.data.id as string;
  }

  async fetchValidation(validationId: string): Promise<{ status: string }> {
    const response = await this.axiosInstance.get(
      `/fund_accounts/validations/${validationId}`,
    );
    return {
      status: this.getStatus(response.data.status),
    };
  }

  getStatus(status: string): BankVerificationStatus {
    switch (status) {
      case 'created':
        return BankVerificationStatus.PENDING;
      case 'completed':
        return BankVerificationStatus.VERIFIED;
      case 'failed':
      default:
        return BankVerificationStatus.FAILED;
    }
  }
}
