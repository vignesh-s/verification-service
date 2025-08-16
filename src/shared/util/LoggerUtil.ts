import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerUtil extends ConsoleLogger {
  constructor() {
    super();
  }

  error(message: any, trace?: string) {
    super.error(message, trace);
    console.error(message, trace);
  }
}
