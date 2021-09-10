import { Injectable } from '@nestjs/common';
import clear from 'clear';

@Injectable()
export class FormattingService {
  public clear(): void {
    clear();
  }
}
