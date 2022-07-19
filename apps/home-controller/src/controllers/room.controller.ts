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
import { GroupService, RoomService } from '@steggy/controller-sdk';
import {
  CloneRoomDTO,
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
  RoomMetadataDTO,
  RoomStateDTO,
} from '@steggy/controller-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@steggy/server';
import { each, eachSeries, is } from '@steggy/utilities';

@Controller('/room')
@AuthStack()
@ApiTags('room')
export class RoomController {
  constructor(
    private readonly room: RoomService,
    private readonly group: GroupService,
  ) {}

  @Post(`/state/:state`)
  public async _activateState(
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    const [room] = await this.room.list({
      filters: new Set([{ field: 'save_states.id', value: state }]),
    });
    if (is.undefined(room)) {
      throw new NotFoundException();
    }
    return await this.activateState(room._id, state);
  }

  @Post(`/:room/state/:state`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a group state`,
  })
  public async activateState(
    @Param('room') room: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.room.activateState({ room, state });
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
    await this.room.addEntity(room, entity);
    return await this.room.getWithStates(room, true, control);
  }

  @Post(`/:room/metadata`)
  public async addMetadata(
    @Param('room') room: string | RoomDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.room.addMetadata(room);
    return await this.room.getWithStates(room, true, control);
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
    await this.room.addState(room, state);
    return await this.room.getWithStates(room, true, control);
  }

  @Post(`/:room/group`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Add link to existing group`,
  })
  public async attachGroup(
    @Param('room') room: string,
    @Body() { groups }: { groups: string[] },
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await eachSeries(groups, async id => {
      await this.room.attachGroup(room, id);
    });
    return await this.room.getWithStates(room, true, control);
  }

  @Post(`/:room/clone`)
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Clone an existing group`,
  })
  public async clone(
    @Param('room') room: string,
    @Body() options: CloneRoomDTO = {},
  ): Promise<RoomDTO> {
    return await this.room.clone(room, options);
  }

  @Post(`/`)
  @ApiBody({ type: RoomDTO })
  @ApiResponse({ type: RoomDTO })
  @ApiOperation({
    description: `Add a new room`,
  })
  public async create(@Body() data: RoomDTO): Promise<RoomDTO> {
    return await this.room.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:room`)
  @ApiOperation({
    description: `Soft delete room`,
  })
  public async delete(
    @Param('room') room: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.room.delete(room);
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
    await this.room.deleteEntity(room, entity);
    return await this.room.getWithStates(room, true, control);
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
    await this.room.deleteGroup(room, group);
    return await this.room.getWithStates(room, true, control);
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
    await this.room.deleteMetadata(room, metadata);
    return await this.room.getWithStates(room, true, control);
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
    await this.room.deleteState(room, state);
    return await this.room.getWithStates(room, true, control);
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
    return await this.room.getWithStates(room, true, control);
  }

  @Get('/:room/group-save-states')
  @ApiResponse({ type: [GroupDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached groups`,
  })
  public async groupSaveStates(
    @Param('room') room: string,
  ): Promise<GroupDTO[]> {
    const roomInfo = await this.room.getWithStates(room);
    const out: GroupDTO[] = [];
    await each(roomInfo.groups, async item => {
      out.push(
        await this.group.getWithStates(item, {
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
    return await this.room.list(control);
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
    await this.room.update(BaseSchemaDTO.cleanup(data), room);
    return await this.room.getWithStates(room, true, control);
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
    @Body() data: Partial<RoomMetadataDTO>,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    await this.room.updateMetadata(room, metadata, data);
    return await this.room.getWithStates(room, true, control);
  }

  @Put(`/:room/metadata-name/:metadata`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Modify room metadata`,
  })
  public async updateMetadataByName(
    @Param('room') roomId: string,
    @Param('metadata') metadata: string,
    @Body() data: RoomMetadataDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<RoomDTO> {
    const room = await this.room.getWithStates(roomId);
    const meta = room.metadata.find(({ name }) => name === metadata);
    await this.room.updateMetadata(room, meta.id, data);
    return await this.room.getWithStates(room, true, control);
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
    await this.room.updateState(room, state, data);
    return await this.room.getWithStates(room, true, control);
  }
}
