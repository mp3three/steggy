import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScheduleActivateService {
  constructor(private readonly logger: AutoLogService) {}
}
