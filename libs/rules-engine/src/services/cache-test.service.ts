import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
