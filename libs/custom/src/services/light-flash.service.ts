import { LIB_CUSTOM } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { LightingControllerService } from './lighting-controller.service';

/**
 * Works with the lighting controller to perform a quick color change flash on light
 */
@Injectable()
export class LightFlashService {
  // #region Constructors

  constructor(
    @InjectLogger(LightFlashService, LIB_CUSTOM)
    private readonly logger: PinoLogger,
    private readonly lightingController: LightingControllerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async colorFlash(
    entities: string[],
    options: {
      color?: string;
    },
  ): Promise<void> {
    // ret
  }

  // #endregion Public Methods
}
