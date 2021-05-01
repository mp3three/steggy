import { PinoLogger } from 'nestjs-pino';
import { iDriver } from '../../typings';

export abstract class BaseDriver {
  // #region Object Properties

  protected readonly driver: iDriver;
  protected readonly logger: PinoLogger;

  // #endregion Object Properties

  // #region Public Methods

  public async create(arg: unknown): Promise<unknown> {
    return await this.driver.create(arg);
  }

  // #endregion Public Methods
}
