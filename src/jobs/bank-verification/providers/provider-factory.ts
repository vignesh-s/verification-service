import { Injectable } from '@nestjs/common';
import { IVerificationProvider } from './provider.interface';
import { RazorpayProvider } from './razorpay.provider';

@Injectable()
export class ProviderFactory {
  private readonly providers: Map<string, IVerificationProvider>;

  constructor(private readonly razorpayProvider: RazorpayProvider) {
    this.providers = new Map<string, IVerificationProvider>([
      ['razorpay', this.razorpayProvider],
    ]);
  }

  getProvider(providerName: string): IVerificationProvider {
    const provider = this.providers.get(providerName.toLowerCase());
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    return provider;
  }
}
