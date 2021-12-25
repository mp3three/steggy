import { AutoLogService } from '@text-based/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
