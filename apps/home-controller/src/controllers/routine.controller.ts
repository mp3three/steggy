import {
  KunamiCodeActivateDTO,
  RoomEntitySaveStateDTO,
  RoutineActivateDTO,
  RoutineActivateOptionsDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@automagical/server';
import { NOT_FOUND } from '@automagical/utilities';
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
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';

import { RoutineService } from '../services';

@Controller(`/routine`)
@AuthStack()
@ApiTags('routine')
@ApiExtraModels(
  KunamiCodeActivateDTO,
  SolarActivateDTO,
  ScheduleActivateDTO,
  StateChangeActivateDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoomEntitySaveStateDTO,
  RoutineCommandWebhookDTO,
  RoutineCommandGroupStateDTO,
)
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post('/:routine')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a routine`,
  })
  public async activate(
    @Param('routine') routine: string,
    @Body() options: RoutineActivateOptionsDTO,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    process.nextTick(async () => {
      await this.routineService.activateRoutine(routine, options);
    });
    return await GENERIC_SUCCESS_RESPONSE;
  }

  @Post('/:routine/activate')
  @ApiBody({ type: RoutineActivateDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Add activation event to routine`,
  })
  public async addActivate(
    @Param('routine') id: string,
    @Body() activate: RoutineActivateDTO,
  ): Promise<RoutineDTO> {
    const routine = await this.routineService.get(id);
    activate.id = uuid();
    routine.activate.push(activate);
    return await this.update(id, routine);
  }

  @Post('/:routine/command')
  @ApiBody({ type: RoutineCommandDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Add activation event to routine`,
  })
  public async addCommand(
    @Param('routine') id: string,
    @Body() command: RoutineCommandDTO,
  ): Promise<RoutineDTO> {
    const routine = await this.routineService.get(id);
    command.id = uuid();
    routine.command.push(command);
    return await this.update(id, routine);
  }

  @Post(`/`)
  @ApiBody({ type: RoutineDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Create new routine`,
  })
  public async create(@Body() body: RoutineDTO): Promise<RoutineDTO> {
    return await this.routineService.create(body);
  }

  @Delete(`/:routine`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Soft delete routine`,
  })
  public async delete(
    @Param('routine') routine: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routineService.delete(routine);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete('/:routine/activate/:activate')
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Add activation event to routine`,
  })
  public async deleteActivate(
    @Param('routine') id: string,
    @Param('activate') activateId: string,
  ): Promise<RoutineDTO> {
    const routine = await this.routineService.get(id);
    routine.activate = routine.activate.filter(item => item.id !== activateId);
    return await this.update(id, routine);
  }

  @Delete('/:routine/command/:command')
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Add activation event to routine`,
  })
  public async deleteCommand(
    @Param('routine') id: string,
    @Param('command') commandId: string,
  ): Promise<RoutineDTO> {
    const routine = await this.routineService.get(id);
    routine.command = routine.command.filter(item => item.id !== commandId);
    return await this.update(id, routine);
  }

  @Get(`/:routine`)
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Load routine by id`,
  })
  public async findById(
    @Param('routine') routine: string,
  ): Promise<RoutineDTO> {
    return await this.routineService.get(routine);
  }

  @Get(`/`)
  @ApiResponse({ type: [RoutineDTO] })
  @ApiOperation({
    description: `List all routines`,
  })
  public async list(
    @Locals() { control }: ResponseLocals,
  ): Promise<RoutineDTO[]> {
    return await this.routineService.list(control);
  }

  @Post('/:routine/command/:command')
  public async testCommand(
    @Param('routine') routine: string,
    @Param('command') command: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routineService.activateCommand(command, routine);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/:routine`)
  @ApiBody({ type: RoutineDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Modify a routine`,
  })
  public async update(
    @Param('routine') routine: string,
    @Body() body: RoutineDTO,
  ): Promise<RoutineDTO> {
    return await this.routineService.update(routine, body);
  }

  @Put('/:routine/activate/:activate')
  @ApiBody({ type: RoutineActivateDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Add activation event to routine`,
  })
  public async updateActivate(
    @Param('routine') id: string,
    @Param('activate') activateId: string,
    @Body() activate: RoutineActivateDTO,
  ): Promise<RoutineDTO> {
    const routine = await this.routineService.get(id);
    routine.activate = routine.activate.map(item => {
      if (item.id !== activateId) {
        return item;
      }
      return {
        ...activate,
        id: activateId,
      };
    });
    return await this.update(id, routine);
  }

  @Put('/:routine/command/:command')
  @ApiBody({ type: RoutineCommandDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Add activation event to routine`,
  })
  public async updateCommand(
    @Param('routine') id: string,
    @Param('command') commandId: string,
    @Body() command: RoutineCommandDTO,
  ): Promise<RoutineDTO> {
    const routine = await this.routineService.get(id);
    const index = routine.command.findIndex(({ id }) => id === commandId);
    if (index === NOT_FOUND) {
      throw new NotFoundException();
    }
    const updated = {
      ...routine.command[index],
      ...command,
      id: commandId,
    };
    routine.command[index] = updated;
    return await this.update(id, routine);
  }
}
