import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/utilities';

@Injectable()
export class LatchCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(): Promise<void> {
    //
  }
}
