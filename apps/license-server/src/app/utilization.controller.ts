import {
  UtilizationResponseDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts';
import { LicenseService, UtilizationCleanup } from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import {
  Body,
  Controller,
  Delete,
  Post,
  UseInterceptors,
} from '@nestjs/common';

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

  /**
   * @Post is legacy call
   */
  @Post('/delete')
  @Delete()
  public utilizationDelete() {
    return this.licenseService.utilizationDelete();
  }

  @Post()
  @UseInterceptors(UtilizationCleanup)
  public utilizationUpdate(
    @Body() body: UtilizationUpdateDTO,
  ): Promise<UtilizationResponseDTO> {
    return this.licenseService.utilizationUpdate(body);
  }

  // #endregion Public Methods
}
