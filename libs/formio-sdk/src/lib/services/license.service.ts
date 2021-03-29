import { Injectable } from '@nestjs/common';
import { iLogger, Logger } from '@automagical/logger';
import {
  LicenseAdminDTO,
  LicenseApiServer,
  LicenseDTO,
  LicenseUsageDTO,
} from '@automagical/contracts';
import { FormioSdkService } from '.';
import { FetchWith, HTTP_Methods } from '../../typings';

@Injectable()
export class LicenseService {
  // #region Static Properties

  public static logger: iLogger;

  // #endregion Static Properties

  // #region Object Properties

  public licenseData: LicenseReport[] = [];

  /**
   * @type Loggers
   */
  private logger = Logger(LicenseService);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly formioSdkService: FormioSdkService) {}

  // #endregion Constructors

  // #region Public Methods

  public async build() {
    this.logger.notice(`Building license report`);
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
        } as LicenseReport;

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
                  return this.formioSdkService.fetch<LicenseItem>({
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
      body: LicenseApiServer | LicenseItem | LicenseFormManager;
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
