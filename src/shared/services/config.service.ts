import { SequelizeModuleOptions } from '@nestjs/sequelize';

export class ConfigService {
  public get(key: string): string {
    return process.env[key] || '';
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get sequelizeConfig(): SequelizeModuleOptions {
    let configuration: SequelizeModuleOptions = {
      dialect: 'postgres',
      host: this.get('POSTGRES_HOST'),
      port: this.getNumber('POSTGRES_PORT'),
      username: this.get('POSTGRES_USERNAME'),
      password: this.get('POSTGRES_PASSWORD'),
      database: this.get('POSTGRES_DATABASE'),
      logging: false,
      autoLoadModels: true,
      pool: {
        max: 20,
        acquire: 30000,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
    if (process.env.NODE_ENV === 'development') {
      configuration = {
        ...configuration,
        logging: console.log,
        sync: { alter: false },
      };
    }
    return configuration;
  }

  get encryption() {
    return {
      secretKey: this.get('ENCRYPTION_KEY'),
    };
  }

  get razorpayConfig() {
    return {
      keyId: this.get('RAZORPAY_KEY_ID'),
      keySecret: this.get('RAZORPAY_KEY_SECRET'),
      baseURL: this.get('RAZORPAY_BASE_URL'),
      sourceAccountNumber: this.get('RAZORPAY_SOURCE_ACCOUNT_NUMBER'),
    };
  }
}
