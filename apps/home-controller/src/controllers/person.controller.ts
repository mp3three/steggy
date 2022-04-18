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
import {
  CloneRoomDTO,
  GroupDTO,
  PersonDTO,
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
import { each } from '@steggy/utilities';

import { GroupService, PersonService, RoomService } from '../services';

@Controller('/person')
@AuthStack()
@ApiTags('person')
export class PersonController {
  constructor(
    private readonly roomService: RoomService,
    private readonly groupService: GroupService,
    private readonly personService: PersonService,
  ) {}

  @Post(`/:person/state/:state`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a group state`,
  })
  public async activateState(
    @Param('person') room: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.personService.activateState({ room, state });
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:person/entity`)
  @ApiBody({ type: RoomEntityDTO })
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add an entity to the room`,
  })
  public async addEntity(
    @Param('person') room: string,
    @Body() entity: RoomEntityDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.addEntity(room, entity);
    return await this.personService.get(room, true, control);
  }

  @Post(`/:person/metadata`)
  public async addMetadata(
    @Param('person') room: string | PersonDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.addMetadata(room);
    return await this.personService.get(room, true, control);
  }

  @Post(`/:person/state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Add state to room`,
  })
  public async addState(
    @Param('person') room: string,
    @Body() state: RoomStateDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.addState(room, state);
    return await this.personService.get(room, true, control);
  }

  @Post(`/:person/group`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add link to existing group`,
  })
  public async attachGroup(
    @Param('person') room: string,
    @Body() { groups }: { groups: string[] },
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await each(
      groups,
      async id => await this.personService.attachGroup(room, id),
    );
    return await this.personService.get(room, true, control);
  }

  @Post(`/:person/clone`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Clone an existing group`,
  })
  public async clone(
    @Param('person') room: string,
    @Body() options: CloneRoomDTO = {},
  ): Promise<PersonDTO> {
    return await this.personService.clone(room, options);
  }

  @Post(`/`)
  @ApiBody({ type: PersonDTO })
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add a new room`,
  })
  public async create(@Body() data: PersonDTO): Promise<PersonDTO> {
    return await this.personService.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:person`)
  @ApiOperation({
    description: `Soft delete room`,
  })
  public async delete(
    @Param('person') room: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.personService.delete(room);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:person/entity/:entity`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Remove entity from room`,
  })
  public async deleteEntity(
    @Param('person') room: string,
    @Param('entity') entity: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.deleteEntity(room, entity);
    return await this.personService.get(room, true, control);
  }

  @Delete(`/:person/group/:group`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Detach group from room`,
  })
  public async deleteGroup(
    @Param('person') room: string,
    @Param('group') group: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.deleteGroup(room, group);
    return await this.personService.get(room, true, control);
  }

  @Delete(`/:person/metadata/:metadata`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Remove metadata from room`,
  })
  public async deleteMetadata(
    @Param('person') room: string,
    @Param('metadata') metadata: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.deleteMetadata(room, metadata);
    return await this.personService.get(room, true, control);
  }

  @Delete(`/:person/state/:state`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Remove state from room`,
  })
  public async deleteState(
    @Param('person') room: string,
    @Param('state') state: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.deleteState(room, state);
    return await this.personService.get(room, true, control);
  }

  @Get('/:person')
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Retrieve room info by id`,
  })
  public async get(
    @Param('person') room: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    return await this.personService.get(room, true, control);
  }

  @Get('/:person/group-save-states')
  @ApiResponse({ type: [GroupDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached groups`,
  })
  public async groupSaveStates(
    @Param('person') room: string,
  ): Promise<GroupDTO[]> {
    const roomInfo = await this.personService.get(room);
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
  @ApiResponse({ type: [PersonDTO] })
  @ApiOperation({
    description: `List all rooms`,
  })
  public async list(
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO[]> {
    return await this.personService.list(control);
  }

  @Get('/:person/room-save-states')
  @ApiResponse({ type: [RoomDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached rooms`,
  })
  public async roomSaveStates(
    @Param('person') room: string,
  ): Promise<RoomDTO[]> {
    const roomInfo = await this.personService.get(room);
    const out: RoomDTO[] = [];
    await each(roomInfo.groups, async item => {
      out.push(
        await this.roomService.get(item, false, {
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

  @Put(`/:person`)
  @ApiBody({ type: PersonDTO })
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Modify a room`,
  })
  public async update(
    @Param('person') room: string,
    @Body() data: Partial<PersonDTO>,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.update(BaseSchemaDTO.cleanup(data), room);
    return await this.personService.get(room, true, control);
  }

  @Put(`/:person/metadata/:metadata`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Modify room metadata`,
  })
  public async updateMetadata(
    @Param('person') room: string,
    @Param('metadata') metadata: string,
    @Body() data: RoomMetadataDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.updateMetadata(room, metadata, data);
    return await this.personService.get(room, true, control);
  }

  @Put(`/:person/metadata-name/:metadata`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Modify room metadata`,
  })
  public async updateMetadataByName(
    @Param('person') roomId: string,
    @Param('metadata') metadata: string,
    @Body() data: RoomMetadataDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    const room = await this.personService.get(roomId);
    const meta = room.metadata.find(({ name }) => name === metadata);
    await this.personService.updateMetadata(room, meta.id, data);
    return await this.personService.get(room, true, control);
  }

  @Put(`/:person/state/:state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Remove a room state`,
  })
  public async updateState(
    @Param('person') room: string,
    @Param('state') state: string,
    @Body() data: RoomStateDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.updateState(room, state, data);
    return await this.personService.get(room, true, control);
  }
}
