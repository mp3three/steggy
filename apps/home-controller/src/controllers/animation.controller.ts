import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FlashAnimationService } from '@automagical/controller-logic';
import { FlashAnimationDTO } from '@automagical/controller-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@automagical/server';

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
