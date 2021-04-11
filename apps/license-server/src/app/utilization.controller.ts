import { LicenseDTO } from '@automagical/contracts/formio-sdk';
import {
  FetchLicense,
  License,
  LicenseService,
  UtilizationCleanup,
} from '@automagical/licenses';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  Body,
  Controller,
  Delete,
  NotImplementedException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  UtilizationResponseDTO,
  UtilizationUpdateDTO,
} from '@automagical/contracts/licenses';

@Controller('utilization')
export class UtilizationController {
  // #region Constructors

  constructor(
    @InjectPinoLogger(UtilizationController.name)
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
