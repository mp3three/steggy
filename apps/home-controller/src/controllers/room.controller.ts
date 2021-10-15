import {
  KunamiSensor,
  ROOM_ENTITY_TYPES,
  RoomDTO,
  RoomEntityDTO,
  RoomSaveStateDTO,
  RoomSensorDTO,
  RoomService,
  SensorEventsService,
} from '@automagical/controller-logic';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
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

@Controller('/room')
@AuthStack()
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly sensorEvents: SensorEventsService,
  ) {}

  @Post(`/:room/state/:state`)
  public async activateState(
    @Param('room') room: string,
    @Param('state') state: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.activateState(room, state);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/:room/entity`)
  public async addEntity(
    @Param('room') room: string,
    @Body() entity: RoomEntityDTO,
  ): Promise<RoomDTO> {
    return await this.roomService.addEntity(room, entity);
  }

  @Post(`/:room/sensor`)
  public async addSensor(
    @Param('room') room: string,
    @Body() sensor: KunamiSensor,
  ): Promise<RoomDTO> {
    return await this.roomService.addSensor(room, sensor);
  }

  @Post(`/:room/state`)
  public async addState(
    @Param('room') room: string,
    @Body() sensor: RoomSaveStateDTO,
  ): Promise<RoomDTO> {
    return await this.roomService.addState(room, sensor);
  }

  @Post(`/:room/group`)
  public async attachGroup(
    @Param('room') room: string,
    @Body() group: { id: string },
  ): Promise<RoomDTO> {
    return await this.roomService.attachGroup(room, group.id);
  }

  @Post(`/`)
  public async create(@Body() data: RoomDTO): Promise<RoomDTO> {
    return await this.roomService.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:room`)
  public async delete(
    @Param('room') room: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.delete(room);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:room/entity/:entity`)
  public async deleteEntity(
    @Param('room') room: string,
    @Param('entity') entity: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteEntity(room, entity);
  }

  @Delete(`/:room/group/:group`)
  public async deleteGroup(
    @Param('room') room: string,
    @Param('group') group: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteGroup(room, group);
  }

  @Delete(`/:room/state/:state`)
  public async deleteSaveState(
    @Param('room') room: string,
    @Param('state') state: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteSaveState(room, state);
  }

  @Delete(`/:room/sensor/:sensor`)
  public async deleteSensor(
    @Param('room') room: string,
    @Param('sensor') sensor: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteSensor(room, sensor);
  }

  @Get('/:room')
  public async describe(@Param('room') room: string): Promise<RoomDTO> {
    return await this.roomService.get(room);
  }

  @Get('/')
  public async list(@Locals() { control }: ResponseLocals): Promise<RoomDTO[]> {
    return await this.roomService.list(control);
  }

  @Post(`/:room/sensor/:sensor`)
  public async triggerSensor(
    @Param('room') room: string,
    @Param('sensor') sensor: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.sensorEvents.trigger(room, sensor);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/:room/turnOff`)
  public async turnOff(
    @Param('room') room: string,
    @Body() { scope }: Record<'scope', ROOM_ENTITY_TYPES | ROOM_ENTITY_TYPES[]>,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.turnOff(room, scope);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/:room/turnOn`)
  public async turnOn(
    @Param('room') room: string,
    @Body() { scope }: Record<'scope', ROOM_ENTITY_TYPES | ROOM_ENTITY_TYPES[]>,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.turnOn(room, scope);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/:room`)
  public async update(
    @Param('room') room: string,
    @Body() data: Partial<RoomDTO>,
  ): Promise<RoomDTO> {
    return await this.roomService.update(BaseSchemaDTO.cleanup(data), room);
  }

  @Put(`/:room/sensor/:sensor`)
  public async updateSensor(
    @Param('room') room: string,
    @Param('sensor') id: string,
    @Body() sensor: RoomSensorDTO,
  ): Promise<RoomDTO> {
    sensor.id = id;
    return await this.roomService.updateSensor(room, sensor);
  }

  @Put(`/:room/state/:stateId`)
  public async updateState(
    @Param('room') room: string,
    @Param('stateId') stateId: string,
    @Body() state: RoomSaveStateDTO,
  ): Promise<RoomDTO> {
    state.id = stateId;
    return await this.roomService.updateState(room, state);
  }
}
