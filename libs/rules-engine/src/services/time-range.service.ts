import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeRangeService {
  constructor(private readonly logger: AutoLogService) {}
}
