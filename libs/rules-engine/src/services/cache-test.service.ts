import { AutoLogService } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
