import { AutoLogService } from '@text-based/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LatchCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(): Promise<void> {
    //
  }
}
