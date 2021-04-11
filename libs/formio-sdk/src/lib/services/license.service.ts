import { LicenseAdminDTO, LicenseDTO } from '@automagical/contracts/formio-sdk';
import {
  LicenseApiServer,
  LicenseItemDTO,
  LicenseReportDTO,
  LicenseUsageDTO,
} from '@automagical/contracts/licenses';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Injectable } from '@nestjs/common';
import { FormioSdkService } from '.';
import { FetchWith, HTTP_Methods } from '../../typings';

@Injectable()
export class LicenseService {
  // #region Object Properties

  public licenseData: LicenseReportDTO[] = [];

  // #endregion Object Properties

  // #region Constructors

  /**
   * @type Loggers
   */
  constructor(
    @InjectPinoLogger(LicenseService.name)
    protected readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async build() {
    this.logger.info(`Building license report`);
    const licenseList = (await this.formioSdkService.fetch({
      url: `/license`,
    })) as LicenseDTO[];
    this.logger.info(`${licenseList.length} licences found`);

    this.licenseData = await Promise.all(
      licenseList.map(async (license) => {
        const admin = (await this.formioSdkService.fetch({
          url: `/license/${license._id}/admin`,
        })) as LicenseAdminDTO;
        const out = {
          admin,
        } as LicenseReportDTO;

        await Promise.all(
          Object.keys(admin.usage).map(async (key: keyof LicenseUsageDTO) => {
            if (['vpat', 'pdfServers'].includes(key)) {
              return;
            }
            out[key] = await this.formioSdkService.fetch({
              url: `/license/${license._id}/utilizations/${key.slice(0, -1)}`,
            });
            if (key === 'projects' && out.projects.length > 0) {
              this.logger.info(
                `Found ${out.projects.length} projects for ${license._id}`,
              );
              out.stages = await Promise.all(
                out.projects.map(async (project) => {
                  return this.formioSdkService.fetch<LicenseItemDTO>({
                    url: `/license/${license._id}/utilizations/stage`,
                    params: {
                      projectId: project.id,
                    },
                  });
                }),
              );
            }
          }),
        );
        return out;
      }),
    );

    return this.licenseData;
  }

  public toggleUsage(
    args: FetchWith<{
      state: boolean;
      body: LicenseApiServer | LicenseItemDTO;
    }>,
  ) {
    this.logger.debug(`toggleUsage`, args);
    return this.formioSdkService.fetch({
      method: HTTP_Methods.POST,
      url: `/utilization/${args.state ? 'enable' : 'disable'}`,
      ...args,
    });
  }

  // #endregion Public Methods
}
