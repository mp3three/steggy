import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
