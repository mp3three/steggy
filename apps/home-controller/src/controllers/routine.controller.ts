import {
  Body,
  Controller,
  Delete,
  Get,
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
import {
  KunamiCodeActivateDTO,
  RoomEntitySaveStateDTO,
  RoutineActivateOptionsDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  RoutineService,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@text-based/controller-logic';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@text-based/server';

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
}
