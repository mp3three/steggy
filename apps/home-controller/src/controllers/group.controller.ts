import { GroupService } from '@automagical/controller-logic';
import {
  ENTITY_EXTRAS_SCHEMA,
  GENERIC_COMMANDS,
  ROOM_ENTITY_EXTRAS,
} from '@automagical/controller-shared';
import { GroupDTO, GroupSaveStateDTO } from '@automagical/controller-shared';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/group')
@ApiTags('group')
@AuthStack()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Put(`/:group/command/:command`)
  @ApiGenericResponse()
  @ApiBody({ schema: { type: 'object' } })
  @ApiOperation({
    description: `Activate a group command`,
  })
  public async activateCommand(
    @Param('group') group: string,
    @Param('command') command: GENERIC_COMMANDS,
    @Body() extra: Record<string, unknown>,
  ): Promise<GroupDTO> {
    await this.groupService.activateCommand({
      command,
      extra,
      group,
    });
    return await this.groupService.get(group);
  }

  @Post(`/:group/state/:state`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a group state`,
  })
  public async activateState(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<GroupDTO> {
    await this.groupService.activateState({ group, state });
    return await this.groupService.get(group);
  }

  @Post(`/:group/state`)
  @ApiBody({ type: GroupSaveStateDTO })
  @ApiOperation({
    description: `Add a new state to an existing group`,
  })
  public async addState(
    @Param('group') group: string,
    @Body() state: GroupSaveStateDTO,
  ): Promise<GroupDTO> {
    state.states ??= [];
    await this.groupService.addState(group, state);
    return await this.groupService.get(group);
  }

  @Post('/:group/capture')
  @ApiGenericResponse()
  @ApiBody({
    schema: {
      properties: { friendlyName: { type: 'string' } },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Take the current state of the group, and add it as a save state`,
  })
  public async captureCurrent(
    @Param('group') group: string,
    @Body() { friendlyName }: { friendlyName: string },
  ): Promise<GroupDTO> {
    await this.groupService.captureState(group, friendlyName);
    return await this.groupService.get(group);
  }

  @Post('/')
  @ApiBody({ type: GroupDTO })
  @ApiResponse({ type: GroupDTO })
  @ApiOperation({
    description: `Create a new group`,
  })
  public async createGroup(@Body() group: GroupDTO): Promise<GroupDTO> {
    await this.groupService.create(BaseSchemaDTO.cleanup(group));
    return await this.groupService.get(group);
  }

  @Delete(`/:group`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Soft delete group`,
  })
  public async deleteGroup(
    @Param('group') group: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.delete(group);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:group/state/:state`)
  @ApiResponse({ type: GroupDTO })
  @ApiOperation({
    description: `Remove a save state from a group`,
  })
  public async deleteSaveSate(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<GroupDTO> {
    await this.groupService.deleteState(group, state);
    return await this.groupService.get(group);
  }

  @Get('/:group')
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupDTO })
  @ApiOperation({
    description: `Retrieve group info by id`,
  })
  public async describe(@Param('group') group: string): Promise<GroupDTO> {
    return await this.groupService.get(group);
  }

  @Put(`/:group/expand`)
  @ApiBody({ schema: ENTITY_EXTRAS_SCHEMA })
  @ApiGenericResponse()
  @ApiOperation({
    description: `Retrieve group info by id, include state + additional info`,
  })
  public async expandState(
    @Param('group') group: string,
    @Body() state: ROOM_ENTITY_EXTRAS,
  ): Promise<GroupDTO> {
    await this.groupService.expandState(group, state);
    return await this.groupService.get(group);
  }

  @Get(`/`)
  @ApiResponse({ type: [GroupDTO] })
  @ApiOperation({
    description: `List all groups`,
  })
  public async listGroups(
    @Locals() { control }: ResponseLocals,
  ): Promise<GroupDTO[]> {
    return await this.groupService.list(control);
  }

  @Delete(`/:group/truncate`)
  @ApiResponse({ type: GroupDTO })
  @ApiOperation({
    description: `Remove all save states from a group`,
  })
  public async truncateStates(
    @Param('group') group: string,
  ): Promise<GroupDTO> {
    await this.groupService.truncate(group);
    return await this.groupService.get(group);
  }

  @Put('/:group')
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupDTO })
  @ApiOperation({
    description: `Modify a group`,
  })
  public async update(
    @Param('group') id: string,
    @Body() body: Partial<GroupDTO>,
  ): Promise<GroupDTO> {
    await this.groupService.update(id, BaseSchemaDTO.cleanup(body));
    return await this.groupService.get(id);
  }

  @Put(`/:group/state/:state`)
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupSaveStateDTO })
  @ApiOperation({
    description: `Modify a group state`,
  })
  public async updateState(
    @Param('group') group: string,
    @Param('state') state: string,
    @Body() body: GroupSaveStateDTO,
  ): Promise<GroupDTO> {
    await this.groupService.updateState(group, state, body);
    return await this.groupService.get(group);
  }
}
