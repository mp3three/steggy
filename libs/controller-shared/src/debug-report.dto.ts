import { GroupDTO, RoomDTO, RoutineDTO } from './schemas';

export class DebugReportDTO {
  public groups: GroupDTO[];
  public rooms: RoomDTO[];
  public routines: RoutineDTO[];
}
