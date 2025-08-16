import { BankAccountVerification } from '../../../models/bank-account-verification.model';

export interface IVerificationProvider {
  verify(verification: BankAccountVerification): Promise<{ status: string }>;
}
