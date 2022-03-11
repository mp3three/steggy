import { GroupService, RoomService } from '@automagical/controller-logic';
import {
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
  RoomMetadataDTO,
  RoomStateDTO,
} from '@automagical/controller-shared';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@automagical/server';
import { each } from '@automagical/utilities';
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

@Controller('/room')
@AuthStack()
@ApiTags('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly groupService: GroupService,
  ) {}
  @Post(`/:room/state/:state`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a group state`,
  })
  public async activateState(
    @Param('room') room: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.activateState({ room, state });
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:room/entity`)
  @ApiBody({ type: RoomEntityDTO })
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Add an entity to the room`,
  })
  public async addEntity(
    @Param('room') room: string,
    @Body() entity: RoomEntityDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.addEntity(room, entity);
    return await this.roomService.get(room, true, control);
  }

  @Post(`/:room/metadata`)
  public async addMetadata(
    @Param('room') room: string | RoomDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.addMetadata(room);
    return await this.roomService.get(room, true, control);
  }

  @Post(`/:room/state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Add state to room`,
  })
  public async addState(
    @Param('room') room: string,
    @Body() state: RoomStateDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.addState(room, state);
    return await this.roomService.get(room, true, control);
  }

  @Post(`/:room/group`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Add link to existing group`,
  })
  public async attachGroup(
    @Param('room') room: string,
    @Body() group: { id: string },
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.attachGroup(room, group.id);
    return await this.roomService.get(room, true, control);
  }

  @Post(`/`)
  @ApiBody({ type: RoomDTO })
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Add a new room`,
  })
  public async create(@Body() data: RoomDTO): Promise<RoomDTO> {
    return await this.roomService.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:room`)
  @ApiOperation({
    description: `Soft delete room`,
  })
  public async delete(
    @Param('room') room: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.delete(room);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:room/entity/:entity`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Remove entity from room`,
  })
  public async deleteEntity(
    @Param('room') room: string,
    @Param('entity') entity: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.deleteEntity(room, entity);
    return await this.roomService.get(room, true, control);
  }

  @Delete(`/:room/group/:group`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Detach group from room`,
  })
  public async deleteGroup(
    @Param('room') room: string,
    @Param('group') group: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.deleteGroup(room, group);
    return await this.roomService.get(room, true, control);
  }

  @Delete(`/:room/metadata/:metadata`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Remove metadata from room`,
  })
  public async deleteMetadata(
    @Param('room') room: string,
    @Param('metadata') metadata: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.deleteMetadata(room, metadata);
    return await this.roomService.get(room, true, control);
  }

  @Delete(`/:room/state/:state`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Remove state from room`,
  })
  public async deleteState(
    @Param('room') room: string,
    @Param('state') state: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.deleteState(room, state);
    return await this.roomService.get(room, true, control);
  }

  @Get('/:room')
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Retrieve room info by id`,
  })
  public async get(
    @Param('room') room: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    return await this.roomService.get(room, true, control);
  }

  @Get('/:room/group-save-states')
  @ApiResponse({ type: [GroupDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached groups`,
  })
  public async groupSaveStates(
    @Param('room') room: string,
  ): Promise<GroupDTO[]> {
    const roomInfo = await this.roomService.get(room);
    const out: GroupDTO[] = [];
    await each(roomInfo.groups, async item => {
      out.push(
        await this.groupService.get(item, {
          select: [
            'friendlyName',
            'type',
            'save_states.friendlyName',
            'save_states.id',
          ],
        }),
      );
    });
    return out;
  }

  @Get('/')
  @ApiResponse({ type: [RoomDTO] })
  @ApiOperation({
    description: `List all rooms`,
  })
  public async list(@Locals() { control }: ResponseLocals): Promise<RoomDTO[]> {
    return await this.roomService.list(control);
  }

  @Put(`/:room`)
  @ApiBody({ type: RoomDTO })
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Modify a room`,
  })
  public async update(
    @Param('room') room: string,
    @Body() data: Partial<RoomDTO>,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.update(BaseSchemaDTO.cleanup(data), room);
    return await this.roomService.get(room, true, control);
  }

  @Put(`/:room/metadata/:metadata`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Modify room metadata`,
  })
  public async updateMetadata(
    @Param('room') room: string,
    @Param('metadata') metadata: string,
    @Body() data: RoomMetadataDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.updateMetadata(room, metadata, data);
    return await this.roomService.get(room, true, control);
  }

  @Put(`/:room/state/:state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Remove a room state`,
  })
  public async updateState(
    @Param('room') room: string,
    @Param('state') state: string,
    @Body() data: RoomStateDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.roomService.updateState(room, state, data);
    return await this.roomService.get(room, true, control);
  }
}
