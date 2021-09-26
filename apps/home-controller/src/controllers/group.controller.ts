import {
  DescribeGroupResponseDTO,
  GroupService,
  GroupSnapshotDetailsDTO,
  RoomControllerSettingsDTO,
  RoomManagerService,
  RoomSettingsPipe,
  RoomStateDTO,
} from '@automagical/controller-logic';
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
} from '@nestjs/common';

@Controller('/room/:name/group')
@AuthStack()
export class GroupController {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly groupService: GroupService,
  ) {}

  @Get('/:group/list-states')
  public async listGroupStates(
    @Param('name') room: string,
    @Param('group') group: string,
  ): Promise<RoomStateDTO[]> {
    return await this.groupService.listStatesByGroup(room, group);
  }

  @Post(`/:group/snapshot`)
  public async createSnapshot(
    @Param('name') room: string,
    @Param('group') group: string,
    @Body(ValidationPipe) body: GroupSnapshotDetailsDTO,
  ): Promise<RoomStateDTO> {
    return await this.groupService.captureState(room, group, body.name);
  }

  @Get('/:group/describe')
  public async describeGroup(
    @Param('name', RoomSettingsPipe) settings: RoomControllerSettingsDTO,
    @Param('group') group: string,
  ): Promise<DescribeGroupResponseDTO> {
    const { friendlyName, groups, name } = settings;
    if (!groups || !Array.isArray(groups[group])) {
      throw new NotFoundException(
        `${friendlyName} does not contain group ${group}`,
      );
    }
    return this.groupService.describeGroup(name, group);
  }

  @Put('/:group/command/:command')
  public async groupCommand(
    @Param('name', RoomSettingsPipe) settings: RoomControllerSettingsDTO,
    @Param('group') group: string,
    @Param('command') command: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    switch (command) {
      case 'turnOn':
        this.groupService.turnOn(settings.name, group);
        break;
      case 'turnOff':
        this.groupService.turnOff(settings.name, group);
        break;
      case 'turnOnCircadian':
        this.groupService.turnOnCircadian(settings.name, group);
        break;
    }
    return GENERIC_SUCCESS_RESPONSE;
  }
}
