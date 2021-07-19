import { APP_DEVTOOLS } from '@automagical/contracts/constants';
import { FetchService, InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eachLimit } from 'async';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { PinoLogger } from 'nestjs-pino';

type PackageType = Record<'dependencies', Record<string, string>>;
@Injectable()
export class PackageLicenseService {
  // #region Constructors

  constructor(
    @InjectLogger(PackageLicenseService, APP_DEVTOOLS)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly fetchService: FetchService,
  ) {
    fetchService.BASE_URL = 'https://raw.githubusercontent.com';
  }

  // #endregion Constructors

  // #region Public Methods

  public async build(): Promise<void> {
    const dependencies = this.configService.get<string[]>(
      'application.FORMIO_LIBS',
      [],
    );
    const rootPackage: PackageType = JSON.parse(
      readFileSync('./package.json', 'utf-8'),
    );
    const deps = new Map<string, string>(
      Object.entries(rootPackage.dependencies),
    );
    await eachLimit(dependencies, 4, async (packageName) => {
      const packageJson = await this.fetchService.fetch<PackageType>({
        url: `/formio/${packageName}/master/package.json`,
      });
      Object.keys(packageJson.dependencies).forEach((key) => {
        if (deps.has(key)) {
          return;
        }
        // eslint-disable-next-line security/detect-object-injection
        deps.set(key, packageJson.dependencies[key]);
      });
      const output = JSON.stringify(
        {
          dependencies: Object.fromEntries(deps.entries()),
        },
        undefined,
        '  ',
      );
      writeFileSync(this.configService.get('application.OUTPUT_PATH'), output);
    });
  }

  // #endregion Public Methods
}
