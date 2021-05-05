import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { LicenseAdminDTO, LicenseDTO } from '@automagical/contracts/formio-sdk';
import {
  LicenseApiServer,
  LicenseItemDTO,
  LicenseReportDTO,
  LicenseScopes,
  LicenseUsageDTO,
} from '@automagical/contracts/licenses';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { FetchWith, HTTP_Methods } from '../../typings';
import { FormioSdkService } from '.';

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
    @InjectLogger(LicenseService, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace({ level: 'warn' })
  public async build(): Promise<LicenseReportDTO[]> {
    const licenseList = (await this.formioSdkService.fetch({
      url: `/license`,
    })) as LicenseDTO[];
    this.logger.debug(`${licenseList.length} licences found`);

    this.licenseData = await Promise.all(
      licenseList.map(async (license) => {
        const admin = await this.formioSdkService.fetch<LicenseAdminDTO>({
          url: `/license/${license._id}/admin`,
        });
        const out = new Map();
        out.set('admin', admin);

        await Promise.all(
          Object.keys(admin.usage).map(async (key: keyof LicenseUsageDTO) => {
            if (
              [LicenseScopes.vpat, LicenseScopes.pdfServer].includes(
                key as LicenseScopes,
              )
            ) {
              return;
            }
            out.set(
              key,
              await this.formioSdkService.fetch({
                url: `/license/${license._id}/utilizations/${key.slice(0, -1)}`,
              }),
            );
            if (key === 'projects' && out.has('projects')) {
              this.logger.info(
                `Found ${out.get('projects').length} projects for ${
                  license._id
                }`,
              );
              out.set(
                'stages',
                await Promise.all(
                  out.get('projects').map(async (project) => {
                    return await this.formioSdkService.fetch<LicenseItemDTO>({
                      params: {
                        projectId: project.id,
                      },
                      url: `/license/${license._id}/utilizations/stage`,
                    });
                  }),
                ),
              );
            }
          }),
        );
        return Object.fromEntries(out) as LicenseReportDTO;
      }),
    );

    return this.licenseData;
  }

  @Trace()
  public async toggleUsage(
    arguments_: FetchWith<{
      state: boolean;
      body: LicenseApiServer | LicenseItemDTO;
    }>,
  ): Promise<unknown> {
    this.logger.debug(`toggleUsage`, arguments_);
    return await this.formioSdkService.fetch({
      method: HTTP_Methods.POST,
      url: `/utilization/${arguments_.state ? 'enable' : 'disable'}`,
      ...arguments_,
    });
  }

  // #endregion Public Methods
}
