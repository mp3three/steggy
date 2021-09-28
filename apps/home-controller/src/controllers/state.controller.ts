import {
  DuplicateStateDTO,
  GroupService,
  RoomManagerService,
  RoomStateDTO,
  StateManagerService,
} from '@automagical/controller-logic';
import { AuthStack, GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
} from '@nestjs/common';

@Controller(`/state`)
@AuthStack()
export class StateController {
  constructor(
    private readonly groupService: GroupService,
    private readonly statePersistence: StateManagerService,
    private readonly roomManager: RoomManagerService,
  ) {}

  @Put('/:id/activate')
  public async setState(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.statePersistence.loadState(id);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:id`)
  public async deleteState(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.statePersistence.deleteState(id);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:id/copy`)
  public async copyState(
    @Param('id') id: string,
    @Body() body: DuplicateStateDTO,
  ): Promise<RoomStateDTO> {
    const settings = this.roomManager.settings.get(body.room);
    if (!settings) {
      throw new BadRequestException(`Room not found ${body.room}`);
    }
    if (!settings.groups[body.group]) {
      throw new BadRequestException(`Group not found ${body.group}`);
    }
    return await this.statePersistence.duplicateState(id, {
      ...body,
      entities: settings.groups[body.group],
    });
  }
}
