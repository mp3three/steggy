import {
  iRoutineCommand,
  RoomService,
  RoutineCommand,
} from '@steggy/controller-sdk';
import {
  RoutineCommandDTO,
  RoutineCommandRoomStateDTO,
} from '@steggy/controller-shared';

@RoutineCommand({
  description: 'Activate a previously saved room state',
  name: 'Room State',
  type: 'room_state',
})
export class RoomStateChangeCommandService
  implements iRoutineCommand<RoutineCommandRoomStateDTO>
{
  constructor(private readonly room: RoomService) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCommandRoomStateDTO>;
    waitForChange: boolean;
  }): Promise<void> {
    await this.room.activateState(command.command, waitForChange);
  }
}
