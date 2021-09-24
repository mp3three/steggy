import {
  DescribeGroupResponseDTO,
  GroupService,
  RoomControllerSettingsDTO,
  RoomManagerService,
  RoomSettingsPipe,
} from '@automagical/controller-logic';
import { GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import { Controller, Get, NotFoundException, Param, Put } from '@nestjs/common';

@Controller('/room/:name/group')
export class GroupController {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly groupService: GroupService,
  ) {}

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
