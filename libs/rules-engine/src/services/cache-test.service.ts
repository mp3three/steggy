import { AutoLogService } from '@steggy/boilerplate';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheTestService {
  constructor(private readonly logger: AutoLogService) {}
}
