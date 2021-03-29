import {
  LicenseDTO,
  UtilizationResponseDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts';
import {
  FetchLicense,
  License,
  LicenseService,
  UtilizationCleanup,
} from '@automagical/licenses';
import { Logger } from '@automagical/logger';
import {
  Body,
  Controller,
  Delete,
  NotImplementedException,
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
    throw new NotImplementedException();
  }

  @Post('/enable')
  public enable() {
    throw new NotImplementedException();
  }

  /**
   * @Post is legacy call
   */
  @Post('/delete')
  @Delete()
  public utilizationDelete() {
    throw new NotImplementedException();
  }

  @Post()
  @FetchLicense()
  @UseInterceptors(UtilizationCleanup)
  public utilizationUpdate(
    @Body() body: UtilizationUpdateDTO,
    @License() license: LicenseDTO,
  ): Promise<UtilizationResponseDTO> {
    return this.licenseService.utilizationUpdate(body, license);
  }

  // #endregion Public Methods
}
