import {
  DescribeGroupResponseDTO,
  GroupRoom,
  GroupRoomInterceptor,
  GroupRoomSettings,
  GroupService,
  GroupSnapshotDetailsDTO,
  RoomControllerSettingsDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { EntityManagerService } from '@automagical/home-assistant';
import {
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  ValidationPipe,
} from '@automagical/server';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';

@Controller('/group')
@AuthStack()
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly entityManager: EntityManagerService,
  ) {}

  @Post(`/:group/snapshot`)
  @UseInterceptors(GroupRoomInterceptor)
  public async createSnapshot(
    @Param('group') name: string,
    @Body(ValidationPipe) body: GroupSnapshotDetailsDTO,
  ): Promise<RoomStateDTO> {
    return await this.groupService.captureState(name, body.name);
  }

  @Get('/:group/describe')
  @UseInterceptors(GroupRoomInterceptor)
  public describeGroup(
    @Param('group') group: string,
    @GroupRoom() room: string,
    @GroupRoomSettings() settings: RoomControllerSettingsDTO,
  ): DescribeGroupResponseDTO {
    const { friendlyName, groups } = settings;
    if (!groups || !Array.isArray(groups[group])) {
      throw new NotFoundException(
        `${friendlyName} does not contain group ${group}`,
      );
    }
    return {
      room,
      states: this.entityManager.getEntity(groups[group]),
    };
  }

  @Put('/:group/command/:command')
  @UseInterceptors(GroupRoomInterceptor)
  public async groupCommand(
    @GroupRoomSettings() settings: RoomControllerSettingsDTO,
    @Param('group') group: string,
    @Param('command') command: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    switch (command) {
      case 'turnOn':
        await this.groupService.turnOn(settings.name, group);
        break;
      case 'turnOff':
        await this.groupService.turnOff(settings.name, group);
        break;
      case 'turnOnCircadian':
        await this.groupService.turnOnCircadian(settings.name, group);
        break;
    }
    return GENERIC_SUCCESS_RESPONSE;
  }

  @UseInterceptors(GroupRoomInterceptor)
  @Get('/:group/list-states')
  public async listGroupStates(
    @GroupRoom() room: string,
    @Param('group') group: string,
  ): Promise<RoomStateDTO[]> {
    return await this.groupService.listStatesByGroup(room, group);
  }
}
