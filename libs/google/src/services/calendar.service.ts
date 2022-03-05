import { AutoLogService } from '@automagical/boilerplate';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarService {
  constructor(private readonly logger: AutoLogService) {}

  public listEvents(): void {
    //
  }
}
