import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StateChangeActivateService {
  constructor(private readonly logger: AutoLogService) {}
}
