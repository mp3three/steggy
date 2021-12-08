import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RulesEngineService {
  constructor(private readonly logger: AutoLogService) {}
}
