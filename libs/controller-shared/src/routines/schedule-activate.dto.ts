import { ApiProperty } from '@nestjs/swagger';

export class ScheduleActivateDTO {
  /**
   * Cron schedule
   */
  @ApiProperty()
  public schedule: string;
}
