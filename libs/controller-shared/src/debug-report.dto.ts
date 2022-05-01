import { ApiProperty } from '@nestjs/swagger';

import { GroupDTO, RoomDTO, RoutineDTO } from './schemas';

export class DebugReportDTO {
  @ApiProperty()
  public groups: GroupDTO[];
  @ApiProperty()
  public rooms: RoomDTO[];
  @ApiProperty()
  public routines: RoutineDTO[];
}
