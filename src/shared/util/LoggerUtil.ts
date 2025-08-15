import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerUtil extends ConsoleLogger {
  constructor() {
    super();
  }
}
