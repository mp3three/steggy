import {
  FlashAnimationDTO,
  FlashAnimationService,
} from '@for-science/controller-logic';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@for-science/server';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller(`/animation`)
@AuthStack()
@ApiTags('animation')
export class AnimationController {
  constructor(private readonly animationService: FlashAnimationService) {}

  @Post('/flash')
  @ApiGenericResponse()
  public flash(
    @Body() animation: FlashAnimationDTO,
  ): typeof GENERIC_SUCCESS_RESPONSE {
    process.nextTick(async () => {
      await this.animationService.flash(animation);
    });
    return GENERIC_SUCCESS_RESPONSE;
  }
}
