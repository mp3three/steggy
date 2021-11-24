import { RoutineDTO, RoutineService } from '@ccontour/controller-logic';
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
import { ApiTags } from '@nestjs/swagger';

@Controller(`/routine`)
@AuthStack()
@ApiTags('routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post('/:routine')
  public async activate(
    @Param('routine') routine: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routineService.activateRoutine(routine);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Post(`/`)
  public async create(@Body() body: RoutineDTO): Promise<RoutineDTO> {
    return await this.routineService.create(body);
  }

  @Delete(`/:routine`)
  public async delete(
    @Param('routine') routine: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.routineService.delete(routine);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get(`/:routine`)
  public async findById(
    @Param('routine') routine: string,
  ): Promise<RoutineDTO> {
    return await this.routineService.get(routine);
  }

  @Get(`/`)
  public async list(
    @Locals() { control }: ResponseLocals,
  ): Promise<RoutineDTO[]> {
    return await this.routineService.list(control);
  }

  @Put(`/:routine`)
  public async update(
    @Param('routine') routine: string,
    @Body() body: RoutineDTO,
  ): Promise<RoutineDTO> {
    return await this.routineService.update(routine, body);
  }
}
