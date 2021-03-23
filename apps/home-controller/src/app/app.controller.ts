import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  // #region Constructors

  constructor(private readonly appService: AppService) {}

  // #endregion Constructors
}
