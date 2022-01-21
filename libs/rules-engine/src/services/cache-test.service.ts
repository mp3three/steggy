import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
