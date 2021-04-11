import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // #region Constructors

  constructor(protected readonly logger: Logger) {}

  // #endregion Constructors

  // #region Public Methods

  @Get()
  public helloWorld(): string {
    return 'Sup';
  }

  // #endregion Public Methods
}
