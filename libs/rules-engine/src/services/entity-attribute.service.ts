import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EntityAttributeService {
  constructor(private readonly logger: AutoLogService) {}
}
