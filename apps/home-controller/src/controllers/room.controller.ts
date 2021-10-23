import {
  EntityFilters,
  RoomDTO,
  RoomEntityDTO,
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

  @Post(`/:room/entity`)
  public async addEntity(
    @Param('room') room: string,
    @Body() entity: RoomEntityDTO,
  ): Promise<RoomDTO> {
    return await this.roomService.addEntity(room, entity);
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
    @Body() filters: EntityFilters,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.turnOff(room, filters);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/:room/turnOn`)
  public async turnOn(
    @Param('room') room: string,
    @Body() filters: EntityFilters,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.roomService.turnOn(room, filters);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/:room`)
  public async update(
    @Param('room') room: string,
    @Body() data: Partial<RoomDTO>,
  ): Promise<RoomDTO> {
    return await this.roomService.update(BaseSchemaDTO.cleanup(data), room);
  }
}
