import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@automagical/boilerplate';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
