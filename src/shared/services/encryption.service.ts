/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from './config.service';

@Injectable()
export class EncryptionService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(textToEncrypt: string): string {
    if (textToEncrypt) {
      const encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(textToEncrypt),
        this.configService.encryption.secretKey,
        {
          mode: CryptoJS.mode.CTR,
        },
      );
      return encrypted.toString();
    }
    return textToEncrypt;
  }
}
