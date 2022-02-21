import { AutoLogService } from '@automagical/boilerplate';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
