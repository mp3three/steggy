import { LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Controller, Delete, Post } from '@nestjs/common';

@Controller('/utilization')
export class LicenseController {
  // #region Object Properties

  private readonly logger = Logger(LicenseController);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly licenseService: LicenseService) {}

  // #endregion Constructors

  // #region Public Methods

  @Post('/disable')
  public disable() {
    return this.licenseService.utilizationDisable();
  }

  @Post('/enable')
  public enable() {
    return this.licenseService.utilizationEnable();
  }

  @Post()
  public utilization() {
    return this.licenseService.utilizationFetch();
  }

  /**
   * @Post is legacy
   */
  @Post('/delete')
  @Delete()
  public delete() {
    return this.licenseService.utilizationDelete();
  }

  // #endregion Public Methods
}
