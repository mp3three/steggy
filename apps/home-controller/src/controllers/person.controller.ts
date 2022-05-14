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
  GroupService,
  PersonService,
  RoomService,
} from '@steggy/controller-sdk';
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
import { each, eachSeries } from '@steggy/utilities';

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
    @Param('person') person: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.personService.activateState({ person, state });
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
    await this.personService.addEntity(person, entity);
    return await this.personService.get(person, true, control);
  }

  @Post(`/:person/metadata`)
  public async addMetadata(
    @Param('person') person: string | PersonDTO,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.addMetadata(person);
    return await this.personService.get(person, true, control);
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
    await this.personService.addState(person, state);
    return await this.personService.get(person, true, control);
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
      await this.personService.attachGroup(person, id);
    });
    return await this.personService.get(person, true, control);
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
      await this.personService.attachRoom(person, id);
    });
    return await this.personService.get(person, true, control);
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
    return await this.personService.clone(person, options);
  }

  @Post(`/`)
  @ApiBody({ type: PersonDTO })
  @ApiResponse({ type: PersonDTO })
  @ApiOperation({
    description: `Add a new person`,
  })
  public async create(@Body() data: PersonDTO): Promise<PersonDTO> {
    return await this.personService.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:person`)
  @ApiOperation({
    description: `Soft delete person`,
  })
  public async delete(
    @Param('person') person: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.personService.delete(person);
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
    await this.personService.deleteEntity(person, entity);
    return await this.personService.get(person, true, control);
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
    await this.personService.deleteGroup(person, group);
    return await this.personService.get(person, true, control);
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
    await this.personService.deleteMetadata(person, metadata);
    return await this.personService.get(person, true, control);
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
    await this.personService.deleteRoom(person, room);
    return await this.personService.get(person, true, control);
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
    await this.personService.deleteState(person, state);
    return await this.personService.get(person, true, control);
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
    return await this.personService.get(person, true, control);
  }

  @Get('/:person/group-save-states')
  @ApiResponse({ type: [GroupDTO] })
  @ApiOperation({
    description: `List all the save states for all the attached groups`,
  })
  public async groupSaveStates(
    @Param('person') person: string,
  ): Promise<GroupDTO[]> {
    const personInfo = await this.personService.get(person);
    const out: GroupDTO[] = [];
    await each(personInfo.groups, async item => {
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

  @Post(`/:person/pin/:type/:target`)
  @ApiResponse({ type: PersonDTO })
  public async itemPin(
    @Param('person')
    person: string,
    @Param('type')
    type: string,
    @Param('target')
    target: string,
  ): Promise<PersonDTO> {
    return await this.personService.itemPin(person, type, target);
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
    return await this.personService.itemUnpin(person, type, target);
  }

  @Get('/')
  @ApiResponse({ type: [PersonDTO] })
  @ApiOperation({
    description: `List all people`,
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
    await each(roomInfo.rooms, async item => {
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
    description: `Modify a person`,
  })
  public async update(
    @Param('person') person: string,
    @Body() data: Partial<PersonDTO>,
    @Locals() { control }: ResponseLocals,
  ): Promise<PersonDTO> {
    await this.personService.update(BaseSchemaDTO.cleanup(data), person);
    return await this.personService.get(person, true, control);
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
    await this.personService.updateMetadata(person, metadata, data);
    return await this.personService.get(person, true, control);
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
    const person = await this.personService.get(personId);
    const meta = person.metadata.find(({ name }) => name === metadata);
    await this.personService.updateMetadata(person, meta.id, data);
    return await this.personService.get(person, true, control);
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
    await this.personService.updateState(person, state, data);
    return await this.personService.get(person, true, control);
  }
}
