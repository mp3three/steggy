import { LicenseService } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import { Body, Controller, Delete, Post } from '@nestjs/common';
import { UtilizationUpdateDTO } from '@automagical/contracts';

@Controller('utilization')
export class UtilizationController {
  // #region Object Properties

  private readonly logger = Logger(UtilizationController);

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
  public utilizationUpdate(@Body() body: UtilizationUpdateDTO) {
    return this.licenseService.utilizationUpdate(body);
  }

  /**
   * @Post is legacy call
   */
  @Post('/delete')
  @Delete()
  public utilizationDelete() {
    return this.licenseService.utilizationDelete();
  }

  // #endregion Public Methods
}
