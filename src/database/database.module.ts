import { Module } from '@nestjs/common';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { ConfigService } from '../shared/services/config.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService): SequelizeModuleOptions =>
        configService.sequelizeConfig,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
