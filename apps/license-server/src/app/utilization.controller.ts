import { APP_LICENSE_SERVER } from '@automagical/contracts/constants';
import { LicenseDTO } from '@automagical/contracts/formio-sdk';
import {
  UtilizationResponseDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts/licenses';
import {
  FetchLicense,
  License,
  LicenseService,
  UtilizationCleanup,
} from '@automagical/licenses';
import { InjectLogger } from '@automagical/utilities';
import {
  Body,
  Controller,
  Delete,
  NotImplementedException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller('utilization')
export class UtilizationController {
  // #region Constructors

  constructor(
    @InjectLogger(UtilizationController, APP_LICENSE_SERVER)
    protected readonly logger: PinoLogger,
    private readonly licenseService: LicenseService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Post('/disable')
  public disable(): never {
    throw new NotImplementedException();
  }

  @Post('/enable')
  public enable(): never {
    throw new NotImplementedException();
  }

  /**
   * @Post is legacy call
   */
  @Post('/delete')
  @Delete()
  public utilizationDelete(): never {
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
