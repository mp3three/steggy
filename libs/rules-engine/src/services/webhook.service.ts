import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  constructor(private readonly logger: AutoLogService) {}
}
