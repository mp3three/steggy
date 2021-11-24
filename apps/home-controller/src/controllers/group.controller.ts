import {
  ENTITY_EXTRAS_SCHEMA,
  GENERIC_COMMANDS,
  ROOM_ENTITY_EXTRAS,
} from '@ccontour/controller-logic';
import {
  GroupDTO,
  GroupSaveStateDTO,
  GroupService,
  HomeControllerResponseLocals,
} from '@ccontour/controller-logic';
import { BaseSchemaDTO } from '@ccontour/persistence';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
} from '@ccontour/server';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('/group')
@ApiTags('group')
@AuthStack()
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Put(`/:group/command/:command`)
  @ApiGenericResponse()
  public async activateCommand(
    @Param('group') group: string,
    @Param('command') command: GENERIC_COMMANDS,
    @Body() extra: Record<string, unknown>,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.activateCommand({
      command,
      extra,
      group,
    });
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:group/state/:state`)
  @ApiGenericResponse()
  public async activateState(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.activateState({ group, state });
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:group/state`)
  @ApiBody({ type: GroupSaveStateDTO })
  public async addState(
    @Param('group') group: string,
    @Body() state: GroupSaveStateDTO,
  ): Promise<GroupDTO> {
    return await this.groupService.addState(group, state);
  }

  @Post('/:group/capture')
  @ApiGenericResponse()
  public async captureCurrent(
    @Param('group') group: string,
    @Body() { name }: { name: string },
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.captureState(group, name);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post('/')
  @ApiBody({ type: GroupDTO })
  @ApiResponse({ type: GroupDTO })
  public async createGroup(@Body() group: GroupDTO): Promise<GroupDTO> {
    return await this.groupService.create(BaseSchemaDTO.cleanup(group));
  }

  @Delete(`/:group`)
  @ApiGenericResponse()
  public async deleteGroup(
    @Param('group') group: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.delete(group);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:group/state/:state`)
  @ApiResponse({ type: GroupDTO })
  public async deleteSaveSate(
    @Param('group') group: string,
    @Param('state') state: string,
  ): Promise<GroupDTO> {
    return await this.groupService.deleteState(group, state);
  }

  @Get('/:group')
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupDTO })
  public async describe(@Param('group') group: string): Promise<GroupDTO> {
    return await this.groupService.get(group);
  }

  @Put(`/:group/expand`)
  @ApiBody({ schema: ENTITY_EXTRAS_SCHEMA })
  @ApiGenericResponse()
  public async expandState(
    @Param('group') group: string,
    @Body() state: ROOM_ENTITY_EXTRAS,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.groupService.expandState(group, state);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get(`/`)
  @ApiResponse({ type: [GroupDTO] })
  public async listGroups(
    @Locals() { control }: HomeControllerResponseLocals,
  ): Promise<GroupDTO[]> {
    return await this.groupService.list(control);
  }

  @Delete(`/:group/truncate`)
  @ApiResponse({ type: GroupDTO })
  public async truncateStates(
    @Param('group') group: string,
  ): Promise<GroupDTO> {
    return await this.groupService.truncate(group);
  }

  @Put('/:group')
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupDTO })
  public async update(
    @Param('group') id: string,
    @Body() body: Partial<GroupDTO>,
  ): Promise<GroupDTO> {
    return await this.groupService.update(id, BaseSchemaDTO.cleanup(body));
  }

  @Put(`/:group/state/:state`)
  @ApiResponse({ type: GroupDTO })
  @ApiBody({ type: GroupSaveStateDTO })
  public async updateState(
    @Param('group') group: string,
    @Param('state') state: string,
    @Body() body: GroupSaveStateDTO,
  ): Promise<GroupDTO> {
    return await this.groupService.updateState(group, state, body);
  }
}
