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
  NX_PROJECT: 'work',
  application: Symbol('offline-license'),
})
export class OfflineLicenseService {
  constructor(
    @InjectConfig('KEY_FILE') private readonly keyFile: string,
    @InjectConfig('ISSUER') private readonly issuer: string,
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
    private readonly screen: ScreenService,
  ) {}

  private key: string;

  public async exec(): Promise<void> {
    this.app.setHeader('Offline License');
    const name = await this.promptService.string('Company Name');
    const scopes = await this.promptService.pickMany('Scopes', [
      ['apiServer', 'apiServer'],
      ['pdfServer', 'pdfServer'],
      ['project', 'project'],
      ['tenant', 'tenant'],
      ['stage', 'stage'],
      ['formManager', 'formManager'],
    ]);
    const projects = await this.promptService.number('Project Limit', SINGLE);
    const years = await this.promptService.number('Years', SINGLE);
    const token = sign(
      {
        exp: dayjs().add(years, 'y').toDate().getTime(),
        iat: Date.now(),
        iss: this.issuer,
        sub: name,
        terms: {
          formMangers: 5,
          livestages: 5,
          options: { sac: true },
          projectsNumberLimit: projects,
          scopes,
          stages: 5,
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
