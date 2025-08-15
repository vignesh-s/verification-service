import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { Models } from '../models';
import { JWT_EXPIRATION_TIME } from './constants/config';
import { ConfigService } from './services/config.service';
import { EncryptionService } from './services/encryption.service';
import { GeneratorService } from './services/generator.service';
import { UtilsService } from './services/utils.service';
import { LoggerUtil } from './util/LoggerUtil';

const providers = [
  ConfigService,
  GeneratorService,
  UtilsService,
  LoggerUtil,
  EncryptionService,
];

@Global()
@Module({
  providers,
  imports: [
    HttpModule,
    SequelizeModule.forFeature(Models),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: JWT_EXPIRATION_TIME,
      },
    }),
  ],
  exports: [...providers, HttpModule, SequelizeModule, JwtModule],
})
export class SharedModule {}
