import { Inject, Injectable } from '@nestjs/common';
import {
  ACTIVE_APPLICATION,
  ConfigItem,
  InjectConfig,
  LibraryModule,
  StringConfig,
} from '@steggy/boilerplate';
import { DOWN, EMPTY, INCREMENT, is, TitleCase, UP } from '@steggy/utilities';
import chalk from 'chalk';
import { exit } from 'process';

import { HELP } from '../config';
import { ansiMaxLength } from '../includes';
import { ApplicationManagerService, ScreenService } from './meta';

@Injectable()
export class TerminalHelpService {
  constructor(
    @Inject(ACTIVE_APPLICATION)
    private readonly application: symbol,
    private readonly applicationManager: ApplicationManagerService,
    private readonly screen: ScreenService,
    @InjectConfig(HELP) private readonly showHelp: boolean,
  ) {}

  protected printProject(
    project: string,
    configuration: Record<string, ConfigItem>,
    LONGEST: number,
  ) {
    this.screen.printLine(
      chalk`Provided by {magenta.bold ${TitleCase(project)}}`,
    );
    Object.entries(configuration)
      .sort(([a], [b]) => (a > b ? UP : DOWN))
      .forEach(([property, config]) => {
        property = property
          .replaceAll('-', '_')
          .toLocaleLowerCase()
          .padEnd(LONGEST, ' ');
        switch (config.type) {
          case 'number':
            this.numberSwitch(property, config);
            break;
          case 'string':
          case 'url':
          case 'password':
            this.stringSwitch(property, config as ConfigItem<StringConfig>);
            break;
          case 'boolean':
            this.booleanSwitch(property, config);
            break;
          default:
            return;
            this.otherSwitch(property, config);
        }
        this.screen.down();
      });
  }

  protected rewire(): void | never {
    if (!this.showHelp) {
      return;
    }
    const application = this.application.description;
    this.applicationManager.setHeader('Help');
    const ALL_SWITCHES: string[] = [];
    const { configs } = LibraryModule;

    configs.forEach(({ configuration }) =>
      ALL_SWITCHES.push(
        ...Object.entries(configuration).map(([property]) => property),
      ),
    );
    this.screen.down();
    const LONGEST =
      Math.max(...ALL_SWITCHES.map(line => line.length)) + INCREMENT;
    this.printProject(
      application,
      configs.get(application).configuration,
      LONGEST,
    );
    configs.forEach(({ configuration }, project) => {
      if (project === application) {
        return;
      }
      this.printProject(project, configuration, LONGEST);
    });
    exit();
  }

  private booleanSwitch(property: string, config: ConfigItem): void {
    const prefix = chalk`  {${
      config.required ? 'red.bold' : 'white'
    } --${property}} {gray [{bold boolean}}${
      is.undefined(config.default as number)
        ? ''
        : chalk`, {gray default}: {bold.green ${config.default}}`
    }{gray ]} `;
    this.screen.printLine(this.formatDescription(prefix, config.description));
  }

  private formatDescription(prefix: string, description: string) {
    const size = ansiMaxLength(prefix);
    return (
      prefix +
      description
        .split('. ')
        .map((line, index) =>
          index === EMPTY ? line : ' '.repeat(size) + line,
        )
        .join(`.\n`)
    );
  }

  private numberSwitch(property: string, config: ConfigItem): void {
    const prefix = chalk`  {${
      config.required ? 'red.bold' : 'white'
    } --${property}} {gray [{bold number}}${
      is.undefined(config.default as number)
        ? ''
        : chalk`, {gray default}: {bold.yellow ${config.default}}`
    }{gray ]} `;
    this.screen.printLine(this.formatDescription(prefix, config.description));
  }

  private otherSwitch(property: string, config: ConfigItem) {
    const prefix = chalk`  {${
      config.required ? 'red.bold' : 'white'
    } --${property}} {gray [other}${
      is.undefined(config.default)
        ? ''
        : chalk`, {gray default}: {bold.magenta ${JSON.stringify(
            config.default,
          )}}`
    }{gray ]} `;
    this.screen.printLine(this.formatDescription(prefix, config.description));
  }

  private stringSwitch(
    property: string,
    config: ConfigItem<StringConfig>,
  ): void {
    const prefix = chalk`  {${
      config.required ? 'red.bold' : 'white'
    } --${property}} {gray [{bold string}}${
      is.empty(config.default as string)
        ? ''
        : chalk`, {gray default}: {bold.blue ${config.default}}`
    }${
      is.empty(config.enum)
        ? ''
        : chalk`{gray , enum}: ${config.enum
            .map(item => chalk.blue(item))
            .join(chalk`{yellow.dim  | }`)}`
    }{gray ]} `;
    this.screen.printLine(this.formatDescription(prefix, config.description));
  }
}
