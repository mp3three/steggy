/* eslint-disable radar/no-duplicate-string */
import { faker } from '@faker-js/faker';
import { QuickScript } from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  TTYModule,
} from '@steggy/tty';
import chalk from 'chalk';

import { ConfigSampler, MenuSampler, PromptSampler } from './services';

// @QuickScript is derived from @Module from NestJS
// imports, providers, controllers all work as expected
//
// After bootstrapping, it will automatically run `exec` on the annotated class
//
@QuickScript({
  application: Symbol('sampler-app'),
  bootstrap: {
    // A configuration passed into bootstrap will be merged into the primary app config.
    // Values provided here take priority over those provided at the config definition.
    //
    // Disagree with a default value a library uses? A build configuration have different requirements?
    // Perfect spot to override the way things work.
    // All user provided values take priority over this value.
    config: {
      application: { APPLICATION_OVERRIDE: faker.hacker.phrase() },
    },
  },
  imports: [TTYModule],
  providers: [ConfigSampler, MenuSampler, PromptSampler],
})
export class SamplerApp {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly prompt: PromptService,
    private readonly promptSampler: PromptSampler,
    private readonly configSampler: ConfigSampler,
  ) {}

  public async exec(value?: string): Promise<void> {
    this.application.setHeader('Sampler App');
    const action = await this.prompt.menu({
      condensed: true,
      hideSearch: true,
      keyMap: { d: ['done'] },
      right: [
        {
          entry: ['Prompts', 'prompts'],
          helpText: chalk`Non-comprehensive demo of the interactions provided by {green.dim @steggy/tty}`,
        },
        {
          entry: ['Configuration', 'config'],
          helpText: chalk`Demo of {green.dim @steggy} Injected configurations`,
        },
      ],
      value,
    });
    switch (action) {
      case 'done':
        return;
      case 'prompts':
        await this.promptSampler.exec();
        break;
      case 'config':
        await this.configSampler.exec();
        break;
    }
    return await this.exec(action);
  }
}
