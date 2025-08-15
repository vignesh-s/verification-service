import { BadRequestException } from '@nestjs/common';
import {
  CreationAttributes,
  ModelStatic,
  Transaction,
  WhereOptions,
} from 'sequelize';
import { Model } from 'sequelize-typescript';
import { messages } from '../shared/constants/messages';
import { UtilsService } from '../shared/services/utils.service';

export class BaseModel extends Model {
  static async findById<M extends BaseModel>(
    this: ModelStatic<M>,
    id: string,
    transaction?: Transaction,
  ): Promise<M> {
    UtilsService.checkValidUUID(id);
    const result = await this.findByPk(id, { transaction });
    if (!result) {
      throw new BadRequestException(messages.INVALID_ID);
    }
    return result;
  }

  static async findOneBy<M extends BaseModel>(
    this: ModelStatic<M>,
    where: WhereOptions,
    transaction?: Transaction,
  ): Promise<M | null> {
    return this.findOne({ where, transaction });
  }

  static async findBy<M extends BaseModel>(
    this: ModelStatic<M>,
    where: WhereOptions,
  ): Promise<M[]> {
    return this.findAll({ where });
  }

  static getIdFilter(id: string): WhereOptions {
    return { id: id };
  }

  static async updateById<M extends BaseModel>(
    this: ModelStatic<M>,
    obj: any,
    id: string,
    transaction?: Transaction,
  ): Promise<[affectedCount: number]> {
    return this.update(obj, {
      where: BaseModel.getIdFilter(id),
      transaction,
    });
  }

  static async updateByIdAndGet<M extends BaseModel>(
    this: ModelStatic<M>,
    obj: any,
    id: string,
    transaction?: Transaction,
  ): Promise<M> {
    UtilsService.checkValidUUID(id);
    const result = await this.update(obj, {
      where: BaseModel.getIdFilter(id),
      returning: true,
      transaction,
    });
    UtilsService.checkRowsAffected(result);
    return result[1][0];
  }

  static async createAndGet<M extends BaseModel>(
    this: ModelStatic<M>,
    values?: CreationAttributes<M>,
  ): Promise<M> {
    return this.create(values, { returning: true });
  }
}
