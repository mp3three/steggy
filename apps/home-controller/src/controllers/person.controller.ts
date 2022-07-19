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
import {
  GroupService,
  PersonService,
  RoomService,
} from '@steggy/controller-sdk';
import {
  CloneRoomDTO,
  GroupDTO,
  InflatedPinDTO,
  PersonDTO,
  PIN_TYPES,
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

@Controller('/person')
@AuthStack()
@ApiTags('person')
export class PersonController {
  constructor(
    private readonly room: RoomService,
    private readonly group: GroupService,
    private readonly person: PersonService,
  ) {}

  @Post(`/state/:state`)
  public async _activateState(
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    const [person] = await this.person.list({
      filters: new Set([{ field: 'save_states.id', value: state }]),
    });
    if (is.undefined(person)) {
      throw new NotFoundException();
    }
    return await this.activateState(person._id, state);
  }

  @Post(`/:person/state/:state`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a group state`,
  })
  public async activateState(
    @Param('person') person: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.person.activateState({ person, state });
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:person/entity`)
  @ApiBody({ type: RoomEntityDTO })
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add an entity to the room`,
  })
  public async addEntity(
    @Param('person') person: string,
    @Body() entity: RoomEntityDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.addEntity(person, entity);
    return await this.person.getWithStates(person, true, control);
  }

  @Post(`/:person/metadata`)
  public async addMetadata(
    @Param('person') person: string | PersonDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.addMetadata(person);
    return await this.person.getWithStates(person, true, control);
  }

  @Post(`/:person/state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Add state to room`,
  })
  public async addState(
    @Param('person') person: string,
    @Body() state: RoomStateDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.addState(person, state);
    return await this.person.getWithStates(person, true, control);
  }

  @Post(`/:person/group`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add link to existing group`,
  })
  public async attachGroup(
    @Param('person') person: string,
    @Body() { groups }: { groups: string[] },
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await eachSeries(groups, async id => {
      await this.person.attachGroup(person, id);
    });
    return await this.person.getWithStates(person, true, control);
  }

  @Post(`/:person/room`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add link to existing group`,
  })
  public async attachRoom(
    @Param('person') person: string,
    @Body() { rooms }: { rooms: string[] },
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await eachSeries(rooms, async id => {
      await this.person.attachRoom(person, id);
    });
    return await this.person.getWithStates(person, true, control);
  }

  @Post(`/:person/clone`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Clone an existing group`,
  })
  public async clone(
    @Param('person') person: string,
    @Body() options: CloneRoomDTO = {},
  ): Promise<PersonDTO> {
    return await this.person.clone(person, options);
  }

  @Post(`/`)
  @ApiBody({ type: PersonDTO })
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add a new person`,
  })
  public async create(@Body() data: PersonDTO): Promise<PersonDTO> {
    return await this.person.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:person`)
  @ApiOperation({
    description: `Soft delete person`,
  })
  public async delete(
    @Param('person') person: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.person.delete(person);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:person/entity/:entity`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Remove entity from person`,
  })
  public async deleteEntity(
    @Param('person') person: string,
    @Param('entity') entity: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.deleteEntity(person, entity);
    return await this.person.getWithStates(person, true, control);
  }

  @Delete(`/:person/group/:group`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Detach group from person`,
  })
  public async deleteGroup(
    @Param('person') person: string,
    @Param('group') group: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.deleteGroup(person, group);
    return await this.person.getWithStates(person, true, control);
  }

  @Delete(`/:person/metadata/:metadata`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Remove metadata from person`,
  })
  public async deleteMetadata(
    @Param('person') person: string,
    @Param('metadata') metadata: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.deleteMetadata(person, metadata);
    return await this.person.getWithStates(person, true, control);
  }

  @Delete(`/:person/person/:person`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Detach person from person`,
  })
  public async deleteRoom(
    @Param('person') person: string,
    @Param('room') room: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.deleteRoom(person, room);
    return await this.person.getWithStates(person, true, control);
  }

  @Delete(`/:person/state/:state`)
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Remove state from person`,
  })
  public async deleteState(
    @Param('person') person: string,
    @Param('state') state: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.deleteState(person, state);
    return await this.person.getWithStates(person, true, control);
  }

  @Get('/:person')
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Retrieve person info by id`,
  })
  public async get(
    @Param('person') person: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    return await this.person.getWithStates(person, true, control);
  }

  @Get('/:person/group-save-states')
  @ApiResponse({ type: [GroupDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached groups`,
  })
  public async groupSaveStates(
    @Param('person') person: string,
  ): Promise<GroupDTO[]> {
    const personInfo = await this.person.getWithStates(person);
    const out: GroupDTO[] = [];
    await each(personInfo.groups, async item => {
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

  @Get(`/:person/pin`)
  @ApiResponse({ type: [InflatedPinDTO] })
  @ApiOperation({
    description: `List all the pinned items for a user, with some supplemental UI information`,
  })
  public async inflatePins(
    @Param('person')
    person: string,
  ): Promise<InflatedPinDTO[]> {
    return await this.person.inflatePins(person);
  }

  @Post(`/:person/pin/:type/:target`)
  @ApiResponse({ type: PersonDTO })
  public async itemPin(
    @Param('person')
    person: string,
    @Param('type')
    type: PIN_TYPES,
    @Param('target')
    target: string,
  ): Promise<PersonDTO> {
    return await this.person.itemPin(person, type, target);
  }

  @Delete(`/:person/pin/:type/:target`)
  @ApiResponse({ type: PersonDTO })
  public async itemUnpin(
    @Param('person')
    person: string,
    @Param('type')
    type: string,
    @Param('target')
    target: string,
  ): Promise<PersonDTO> {
    return await this.person.itemUnpin(person, type, target);
  }

  @Get('/')
  @ApiResponse({ type: [PersonDTO] })
  @ApiOperation({
    description: `List all people`,
  })
  public async list(
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO[]> {
    return await this.person.list(control);
  }

  @Get('/:person/room-save-states')
  @ApiResponse({ type: [RoomDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached rooms`,
  })
  public async roomSaveStates(
    @Param('person') room: string,
  ): Promise<RoomDTO[]> {
    const roomInfo = await this.person.getWithStates(room);
    const out: RoomDTO[] = [];
    await each(roomInfo.rooms, async item => {
      out.push(
        await this.room.getWithStates(item, false, {
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
    description: `Modify a person`,
  })
  public async update(
    @Param('person') person: string,
    @Body() data: Partial<PersonDTO>,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.update(BaseSchemaDTO.cleanup(data), person);
    return await this.person.getWithStates(person, true, control);
  }

  @Put(`/:person/metadata/:metadata`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Modify person metadata`,
  })
  public async updateMetadata(
    @Param('person') person: string,
    @Param('metadata') metadata: string,
    @Body() data: RoomMetadataDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.updateMetadata(person, metadata, data);
    return await this.person.getWithStates(person, true, control);
  }

  @Put(`/:person/metadata-name/:metadata`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Modify room metadata`,
  })
  public async updateMetadataByName(
    @Param('person') personId: string,
    @Param('metadata') metadata: string,
    @Body() data: RoomMetadataDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    const person = await this.person.getWithStates(personId);
    const meta = person.metadata.find(({ name }) => name === metadata);
    await this.person.updateMetadata(person, meta.id, data);
    return await this.person.getWithStates(person, true, control);
  }

  @Put(`/:person/state/:state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  @ApiOperation({
    description: `Remove a person state`,
  })
  public async updateState(
    @Param('person') person: string,
    @Param('state') state: string,
    @Body() data: RoomStateDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.person.updateState(person, state, data);
    return await this.person.getWithStates(person, true, control);
  }
}
