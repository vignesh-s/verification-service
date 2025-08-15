import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

@Injectable()
export class GeneratorService {
  public uuid(): string {
    return v4();
  }
}
