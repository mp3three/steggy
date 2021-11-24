import {
  RoomDTO,
  RoomEntityDTO,
  RoomService,
  RoomStateDTO,
} from '@ccontour/controller-logic';
import { BaseSchemaDTO } from '@ccontour/persistence';
import {
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
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

@Controller('/room')
@AuthStack()
@ApiTags('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post(`/:room/state/:state`)
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
  public async addEntity(
    @Param('room') room: string,
    @Body() entity: RoomEntityDTO,
  ): Promise<RoomDTO> {
    return await this.roomService.addEntity(room, entity);
  }

  @Post(`/:room/state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  public async addState(
    @Param('room') room: string,
    @Body() state: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    return await this.roomService.addState(room, state);
  }

  @Post(`/:room/group`)
  @ApiResponse({ type: RoomDTO })
  public async attachGroup(
    @Param('room') room: string,
    @Body() group: { id: string },
  ): Promise<RoomDTO> {
    return await this.roomService.attachGroup(room, group.id);
  }

  @Post(`/`)
  @ApiBody({ type: RoomDTO })
  @ApiResponse({ type: RoomDTO })
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
  @ApiResponse({ type: RoomDTO })
  public async deleteEntity(
    @Param('room') room: string,
    @Param('entity') entity: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteEntity(room, entity);
  }

  @Delete(`/:room/group/:group`)
  @ApiResponse({ type: RoomDTO })
  public async deleteGroup(
    @Param('room') room: string,
    @Param('group') group: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteGroup(room, group);
  }

  @Delete(`/:room/state/:state`)
  @ApiResponse({ type: RoomDTO })
  public async deleteState(
    @Param('room') room: string,
    @Param('state') state: string,
  ): Promise<RoomDTO> {
    return await this.roomService.deleteState(room, state);
  }

  @Get('/:room')
  @ApiResponse({ type: RoomDTO })
  public async describe(@Param('room') room: string): Promise<RoomDTO> {
    return await this.roomService.get(room);
  }

  @Get('/')
  @ApiResponse({ type: [RoomDTO] })
  public async list(@Locals() { control }: ResponseLocals): Promise<RoomDTO[]> {
    return await this.roomService.list(control);
  }

  @Put(`/:room`)
  @ApiBody({ type: RoomDTO })
  @ApiResponse({ type: RoomDTO })
  public async update(
    @Param('room') room: string,
    @Body() data: Partial<RoomDTO>,
  ): Promise<RoomDTO> {
    return await this.roomService.update(BaseSchemaDTO.cleanup(data), room);
  }

  @Put(`/:room/state/:state`)
  @ApiBody({ type: RoomStateDTO })
  @ApiResponse({ type: RoomStateDTO })
  public async updateState(
    @Param('room') room: string,
    @Param('state') state: string,
    @Body() data: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    return await this.roomService.updateState(room, state, data);
  }
}
