import { AutoLogService, InjectConfig } from '@automagical/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  QuickScript,
  ScreenService,
} from '@automagical/tty';
import { SINGLE } from '@automagical/utilities';
import { InternalServerErrorException } from '@nestjs/common';
import dayjs from 'dayjs';
import { existsSync, readFileSync } from 'fs';
import { sign } from 'jsonwebtoken';

@QuickScript({
  OVERRIDE_DEFAULTS: {
    libs: { boilerplate: { LOG_LEVEL: 'warn' } },
  },
  application: Symbol('offline-license'),
})
export class OfflineLicenseService {
  constructor(
    @InjectConfig('KEY_FILE') private readonly keyFile: string,
    @InjectConfig('ISSUER') private readonly issuer: string,
    @InjectConfig('SCOPES') private readonly scopes: string[] = [],
    @InjectConfig('TERMS') private readonly terms: Record<string, unknown> = {},
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
    private readonly screen: ScreenService,
  ) {}

  private key: string;

  public async exec(): Promise<void> {
    this.app.setHeader('Offline License');
    const sub = await this.promptService.string('Company Name');
    const scopes = await this.promptService.pickMany(
      'Scopes',
      this.scopes.map(i => [i, i]),
    );
    const projectsNumberLimit = await this.promptService.number(
      'Project Limit',
      SINGLE,
    );
    const years = await this.promptService.number('Years', SINGLE);
    const token = sign(
      {
        exp: dayjs().add(years, 'y').toDate().getTime(),
        iat: Date.now(),
        iss: this.issuer,
        sub,
        terms: {
          ...this.terms,
          projectsNumberLimit,
          scopes,
        },
      },
      this.key,
      { algorithm: 'PS256' },
    );
    this.screen.print(`\n${token}\n`);
    await this.promptService.acknowledge();
  }

  protected onModuleInit(): void {
    if (!existsSync(this.keyFile)) {
      throw new InternalServerErrorException(
        `Invalid keyfile path: ${this.keyFile}`,
      );
    }
    this.logger.debug(`Loaded {${this.keyFile}}`);
    this.key = readFileSync(this.keyFile, 'utf8');
  }
}
