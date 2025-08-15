import { Column, DataType, Default, Table } from 'sequelize-typescript';
import { BankVerificationProvider } from '../enums/bank-verification-provider.enum';
import { BankVerificationStatus } from '../enums/bank-verification-status.enum';
import { BaseModel } from './base-model.model';

@Table
export class BankAccountVerification extends BaseModel {
  @Column({
    primaryKey: true,
    autoIncrement: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column(DataType.TEXT)
  declare accountHolderName: string;

  @Column(DataType.STRING)
  declare accountNumber: string;

  @Column(DataType.STRING)
  declare ifscCode: string;

  @Default(BankVerificationProvider.RAZORPAY)
  @Column({
    type: DataType.ENUM(...Object.values(BankVerificationProvider)),
  })
  declare provider: BankVerificationProvider;

  @Default(BankVerificationStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(BankVerificationStatus)),
  })
  declare status: BankVerificationStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare failureReason: string;
}
