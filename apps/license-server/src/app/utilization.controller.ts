import { Logger } from '@automagical/logger';
import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/utilization')
export class LicenseController {
  // #region Object Properties

  private readonly logger = Logger(LicenseController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly appService: AppService) {}

  // #endregion Constructors

  // #region Public Methods

  @Post('/disable')
  public disable() {
    return this.appService.utilizationDisable();
  }

  @Post('/enable')
  public enable() {
    return this.appService.utilizationEnable();
  }

  @Post()
  public utilization() {
    return this.appService.utilizationFetch();
  }

  /**
   * @Post is legacy
   */
  @Post('/delete')
  @Delete()
  public delete() {
    return this.appService.utilizationDelete();
  }

  // #endregion Public Methods
}
