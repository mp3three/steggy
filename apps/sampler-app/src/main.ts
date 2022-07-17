/* eslint-disable radar/no-duplicate-string */
import { QuickScript } from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
  SyncLoggerService,
  TextRenderingService,
  TTYModule,
} from '@steggy/tty';

import { MenuSampler, PromptSampler } from './services';

@QuickScript({
  application: Symbol('sampler-app'),
  imports: [TTYModule],
  providers: [MenuSampler, PromptSampler],
})
export class SamplerApp {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
    private readonly promptSampler: PromptSampler,
    private readonly logger: SyncLoggerService,
  ) {}

  public async exec(): Promise<void> {
    await this.promptSampler.exec();
    await this.prompt.acknowledge('All done');
  }
}
