import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupService } from '@steggy/controller-sdk';
import {
  CloneGroupDTO,
  ENTITY_EXTRAS_SCHEMA,
  GROUP_REFERENCE_TYPES,
  GroupDTO,
  GroupSaveStateDTO,
  ROOM_ENTITY_EXTRAS,
} from '@steggy/controller-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@steggy/server';
import { is } from '@steggy/utilities';

@Controller('/group')
@ApiTags('group')
@AuthStack()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post(`/state/:state`)
  public async _activateState(
    @Param('state') state: string,
  ): Promise<GroupDTO> {
    const [group] = await this.groupService.list({
      filters: new Set([{ field: 'save_states.id', value: state }]),
    });
    if (is.undefined(group)) {
      throw new NotFoundException();
    }
    return await this.activateState(group._id, state);
  }

  @Put(`/:group/command/:command`)
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ schema: { type: 'object' } })
  @ApiOperation({
    description: `Activate a group command`,
  })
  public async activateCommand(
    @Param('group') group: string,
    @Param('command') command: string,
    @Body() extra: Record<string, unknown>,
  ): Promise<GroupDTO> {
    await this.groupService.activateCommand({
      command,
      extra,
      group,
    });
    return await this.groupService.getWithStates(group);
  }

  @Post(`/:group/state/:state`)
  @ApiResponse({ type: GroupDTO })
  @ApiOperation({
    description: `Activate a group state`,
  })
  public async activateState(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<GroupDTO> {
    await this.groupService.activateState({ group, state });
    return await this.groupService.getWithStates(group);
  }

  @Post(`/:group/reference`)
  @ApiResponse({ type: GroupDTO })
  public async addReference(
    @Param('group') group: string,
    @Body()
    body: { references: string[]; type: `${GROUP_REFERENCE_TYPES}` },
  ): Promise<GroupDTO> {
    const target = await this.groupService.getWithStates(group);
    target.references ??= [];
    await this.groupService.update(group, {
      references: [
        ...target.references,
        ...body.references.map(target => ({ target, type: body.type })),
      ],
    });
    return await this.groupService.getWithStates(group);
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
    return await this.groupService.getWithStates(group);
  }

  @Post('/:group/capture')
  @ApiResponse({ type: GroupDTO })
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
    return await this.groupService.getWithStates(group);
  }

  @Post(`/:group/clone`)
  @ApiOperation({
    description: `Duplicate a group`,
  })
  @ApiResponse({ type: GroupDTO })
  public async cloneGroup(
    @Param('group') group: string,
    @Body() cloneInfo: CloneGroupDTO = {},
  ): Promise<GroupDTO> {
    return await this.groupService.clone(group, cloneInfo);
  }

  @Post('/')
  @ApiBody({ type: GroupDTO })
  @ApiResponse({ type: GroupDTO })
  @ApiOperation({
    description: `Create a new group`,
  })
  public async createGroup(@Body() group: GroupDTO): Promise<GroupDTO> {
    group = await this.groupService.create(BaseSchemaDTO.cleanup(group));
    return await this.groupService.getWithStates(group);
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

  @Delete(`/:group/reference/:reference`)
  @ApiOperation({
    description: `Remove a reference from a group`,
  })
  public async deleteReference(
    @Param('group') group: string,
    @Param('reference') reference: string,
  ): Promise<GroupDTO> {
    await this.groupService.deleteReference(group, reference);
    return await this.groupService.getWithStates(group);
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
    return await this.groupService.getWithStates(group);
  }

  @Get('/:group')
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupDTO })
  @ApiOperation({
    description: `Retrieve group info by id`,
  })
  public async describe(@Param('group') group: string): Promise<GroupDTO> {
    return await this.groupService.getWithStates(group);
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
    return await this.groupService.getWithStates(group);
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
    return await this.groupService.getWithStates(group);
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
    return await this.groupService.getWithStates(id);
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
    return await this.groupService.getWithStates(group);
  }
}
