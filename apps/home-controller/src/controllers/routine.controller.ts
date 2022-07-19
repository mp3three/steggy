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
import { SERIALIZE } from '@steggy/boilerplate';
import { RoutineService } from '@steggy/controller-sdk';
import {
  CloneRoutineDTO,
  GeneralSaveStateDTO,
  GenericImport,
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
  SequenceActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@steggy/controller-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@steggy/server';
import { is, NOT_FOUND } from '@steggy/utilities';
import { nextTick } from 'process';
import { v4 as uuid } from 'uuid';

@Controller(`/routine`)
@AuthStack()
@ApiTags('routine')
@ApiExtraModels(
  SequenceActivateDTO,
  SolarActivateDTO,
  ScheduleActivateDTO,
  StateChangeActivateDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  GeneralSaveStateDTO,
  RoutineCommandWebhookDTO,
  RoutineCommandGroupStateDTO,
)
export class RoutineController {
  constructor(private readonly routine: RoutineService) {}

  @Get('/tags')
  @ApiResponse({
    schema: {
      properties: {
        tags: { items: { type: 'string' }, type: 'array' },
      },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `List all tags currently in use for routines`,
  })
  public async routineTags(): Promise<{ tags: string[] }> {
    return {
      tags: await this.routine.allTags(),
    };
  }

  @Post('/import')
  public async import(@Body() body: GenericImport): Promise<RoutineDTO> {
    if (is.empty(body.import)) {
      return await this.create({ friendlyName: body.friendlyName });
    }
    return await this.routine.import(body.import, body.friendlyName);
  }

  @Get('/:routine/export')
  public async export(@Param('routine') id: string): Promise<{ text: string }> {
    const routine = await this.routine.get(id);
    if (!routine) {
      throw new NotFoundException();
    }
    return { text: SERIALIZE.serialize(routine) };
  }

  @Post('/:routine')
  @ApiGenericResponse()
  @ApiOperation({
    description: `Activate a routine`,
  })
  public activate(
    @Param('routine') routine: string,
    @Body() options: RoutineActivateOptionsDTO,
  ): typeof GENERIC_SUCCESS_RESPONSE {
    nextTick(async () => await this.routine.activateRoutine(routine, options));
    return GENERIC_SUCCESS_RESPONSE;
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
    const routine = await this.routine.get(id);
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
    const routine = await this.routine.get(id);
    command.id = uuid();
    routine.command.push(command);
    return await this.update(id, routine);
  }

  @Post(`/:routine/clone`)
  @ApiBody({ type: CloneRoutineDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Clone a routine`,
  })
  public async clone(
    @Param('routine') routine: string,
    @Body()
    options: CloneRoutineDTO,
  ): Promise<RoutineDTO> {
    return await this.routine.clone(routine, options);
  }

  @Post(`/`)
  @ApiBody({ type: RoutineDTO })
  @ApiResponse({ type: RoutineDTO })
  @ApiOperation({
    description: `Create new routine`,
  })
  public async create(@Body() body: RoutineDTO): Promise<RoutineDTO> {
    return await this.routine.create(body);
  }

  @Delete(`/:routine`)
  @ApiGenericResponse()
  @ApiOperation({
    description: `Soft delete routine`,
  })
  public async delete(
    @Param('routine') routine: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routine.delete(routine);
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
    const routine = await this.routine.get(id);
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
    const routine = await this.routine.get(id);
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
    return await this.routine.get(routine);
  }

  @Get(`/`)
  @ApiResponse({ type: [RoutineDTO] })
  @ApiOperation({
    description: `List all routines`,
  })
  public async list(
    @Locals() { control }: ResponseLocals,
  ): Promise<RoutineDTO[]> {
    return await this.routine.list(control);
  }

  @Post('/:routine/command/:command')
  public async testCommand(
    @Param('routine') routine: string,
    @Param('command') command: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routine.activateCommand(command, routine);
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
    return await this.routine.update(routine, body);
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
    const routine = await this.routine.get(id);
    routine.activate = routine.activate.map(item => {
      if (item.id !== activateId) {
        return item;
      }
      return {
        ...item,
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
    const routine = await this.routine.get(id);
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
