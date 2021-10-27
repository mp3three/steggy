import { RoutineDTO, RoutineService } from '@automagical/controller-logic';
import { AuthStack, Locals, ResponseLocals } from '@automagical/server';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller(`/routine`)
@AuthStack()
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post(`/`)
  public async create(@Body() body: RoutineDTO): Promise<RoutineDTO> {
    return await this.routineService.create(body);
  }

  @Get(`/`)
  public async list(
    @Locals() { control }: ResponseLocals,
  ): Promise<RoutineDTO[]> {
    return await this.routineService.list(control);
  }
}
