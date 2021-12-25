import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/utilities';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
