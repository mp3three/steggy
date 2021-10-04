import {
  GroupDTO,
  GroupSaveState,
  GroupService,
  HomeControllerResponseLocals,
} from '@automagical/controller-logic';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
} from '@automagical/server';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

@Controller('/group')
@AuthStack()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Put(`/:group/:state`)
  public async activateState(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.activateState(group, state);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:id`)
  public async addState(
    @Param('group') group: string,
    @Body() state: GroupSaveState,
  ): Promise<GroupDTO> {
    return await this.groupService.addState(group, state);
  }

  @Post('/:group/capture')
  public async captureCurrent(
    @Param('group') group: string,
    @Body() { name }: { name: string },
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.captureState(group, name);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post('/')
  public async createGroup(@Body() group: GroupDTO): Promise<GroupDTO> {
    return await this.groupService.create(BaseSchemaDTO.cleanup(group));
  }

  @Delete(`/:group`)
  public async deleteGroup(
    @Param('group') group: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.delete(group);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:group/:state`)
  public async deleteSaveSate(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<GroupDTO> {
    return await this.groupService.deleteState(group, state);
  }

  @Get('/:group')
  public async describe(@Param('group') group: string): Promise<GroupDTO> {
    return await this.groupService.get(group);
  }

  @Get(`/`)
  public async listGroups(
    @Locals() { control }: HomeControllerResponseLocals,
  ): Promise<GroupDTO[]> {
    return await this.groupService.list(control);
  }

  @Put('/:group')
  public async updateGroup(
    @Param('group') id: string,
    @Body() body: Partial<GroupDTO>,
  ): Promise<GroupDTO> {
    return await this.groupService.update(id, BaseSchemaDTO.cleanup(body));
  }
}
