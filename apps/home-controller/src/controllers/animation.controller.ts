import {
  AnimationService,
  FlashAnimationDTO,
} from '@ccontour/controller-logic';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@ccontour/server';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller(`/animation`)
@AuthStack()
@ApiTags('animation')
export class AnimationController {
  constructor(private readonly animationService: AnimationService) {}

  @Post('/flash')
  @ApiGenericResponse()
  public async flash(
    @Body() animation: FlashAnimationDTO,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.animationService.flash(animation);
    return GENERIC_SUCCESS_RESPONSE;
  }
}
