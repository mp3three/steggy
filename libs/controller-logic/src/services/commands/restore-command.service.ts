import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/utilities';

@Injectable()
export class RestoreCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(): Promise<void> {
    //
  }
}
