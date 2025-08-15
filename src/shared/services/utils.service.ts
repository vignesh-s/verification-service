import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'sequelize/types';

import { messages } from '../constants/messages';

@Injectable()
export class UtilsService {
  constructor() {}

  static checkRowsAffected<M extends Model>(updateQueryResult: [number, M[]]) {
    if (updateQueryResult[0] == 0) {
      throw new BadRequestException({
        message: messages.NO_MATCHING_ROW_FOUND,
      });
    }
  }

  static checkValidUUID(id: string) {
    if (!this.isUUID(id)) {
      throw new BadRequestException({
        message: messages.INVALID_ID,
      });
    }
  }

  static isUUID(s: string) {
    return s.match(
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    );
  }

  static isValidCronJon() {
    const nodeAppInstance = process.env.NODE_APP_INSTANCE || '0';
    console.log('node app instance value', nodeAppInstance);
    const nodeAppInstanceValue = parseFloat(nodeAppInstance);
    if (nodeAppInstanceValue == 0) {
      return true;
    } else {
      return false;
    }
  }
}
