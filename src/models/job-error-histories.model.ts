import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from './base-model.model';

@Table
export class JobErrorHistory extends BaseModel {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column(DataType.UUID)
  declare associatedTableId: string;

  @Column(DataType.STRING)
  declare jobName: string;

  @Column(DataType.TEXT)
  declare error: string;
}
