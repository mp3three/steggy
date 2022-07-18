import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
} from '@steggy/tty';
import { DEFAULT_LIMIT } from '@steggy/utilities';
import chalk from 'chalk';
import { exit } from 'process';

const LINE = 75;

@Injectable()
export class ConfigSampler {
  constructor(
    private readonly prompt: PromptService,
    private readonly application: ApplicationManagerService,
    private readonly screen: ScreenService,
    @InjectConfig('BOOLEAN_CONFIG', {
      description: 'Generic boolean config',
      type: 'boolean',
    })
    private readonly configBoolean: boolean,
    @InjectConfig('EARLY_ABORT', {
      description:
        'If provided, the script will print some lorem ipsum and do nothing productive',
      type: 'boolean',
    })
    private readonly earlyAbort: boolean,
    @InjectConfig('STRING_CONFIG', {
      description: 'Generic string config',
      type: 'string',
    })
    private readonly configString: string,
    @InjectConfig('NUMBER_CONFIG', {
      description: 'Generic number config',
      type: 'number',
    })
    private readonly configNumber: number,
    @InjectConfig('RECORD_CONFIG', {
      description: 'key=value style config',
      type: 'record',
    })
    private readonly configRecord: Record<string, unknown>,
    @InjectConfig('STRING_ARRAY_CONFIG', {
      description: 'Array of strings',
      type: 'string[]',
    })
    private readonly configStringArray: string[],
    @InjectConfig('INTERNAL_CONFIG', {
      description: 'Complex data',
      type: 'internal',
    })
    private readonly configInternal: unknown,
    @InjectConfig('BOOT_OVERRIDE', {
      default: 'Definitely not saying anything weird here',
      description: 'A configuration item with an application level override',
      type: 'string',
    })
    private readonly bootOverride: string,
    @InjectConfig('DEFAULTED_CONFIG', {
      default: faker.internet.exampleEmail(),
      description: 'A configuration with a default value',
      type: 'string',
    })
    private readonly defaultedConfig: string,
  ) {}

  public async exec(): Promise<void> {
    this.application.setHeader('Config Sampler');
    // eslint-disable-next-line no-console
    console.log({
      boolean: this.configBoolean,
      bootOverride: this.bootOverride,
      configStringArray: this.configStringArray,
      defaultedConfig: this.defaultedConfig,
      earlyAbort: this.earlyAbort,
      internal: this.configInternal,
      number: this.configNumber,
      record: this.configRecord,
      string: this.configString,
    });
    this.screen.printLine(
      [
        chalk``,
        chalk.blue.dim('='.repeat(LINE)),
        chalk``,
        chalk` {green.dim @steggy/boilerplate} is capable of scanning applications, and `,
        `    producing a report of all available configuration items a script can accept.`,
        chalk`    {bold Configurations will be consumed from} {gray (in order of priority)}{bold :}`,
        chalk`     {yellow.bold - }{cyan command line switches}`,
        chalk`     {yellow.bold - }{cyan environment variables}`,
        chalk`     {yellow.bold - }{cyan file based configurations}`,
        chalk`     {yellow.bold - }{cyan application defaults}`,
        chalk`     {yellow.bold - }{cyan config definition defaults}`,
        chalk``,
        chalk``,
        chalk` {green.dim @steggy/tty}, when imported, makes available the {yellow.bold --help} switch.`,
        `    This switch produces a report on switches made available boilerplate.`,
        chalk``,
        chalk``,
        chalk` {green.dim @steggy/config-builder} can accept this report, and guide users`,
        `    in creating valid environment variables / file based configurations. `,
        chalk``,
        chalk` {bgGreen.black sampler-app --scan-config > config.json; config-builder --definition_file ./config.json}`,
        chalk``,
        chalk``,
      ].join(`\n`),
    );
    await this.prompt.acknowledge();
  }

  protected rewire(): void | never {
    if (this.earlyAbort) {
      this.screen.print(faker.lorem.paragraphs(DEFAULT_LIMIT, `\n\n`));
      exit();
    }
  }
}
