import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomCodeService {
  constructor(private readonly logger: AutoLogService) {}
}
