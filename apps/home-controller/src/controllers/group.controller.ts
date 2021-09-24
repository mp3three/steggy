import {
  DescribeGroupResponseDTO,
  GroupService,
  RoomControllerSettingsDTO,
  RoomManagerService,
  RoomSettingsPipe,
} from '@automagical/controller-logic';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

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
}
