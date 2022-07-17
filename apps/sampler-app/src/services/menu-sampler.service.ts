/* eslint-disable radar/no-duplicate-string */
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import {
  ApplicationManagerService,
  MainMenuEntry,
  MenuComponentOptions,
  PromptService,
  ScreenService,
  template,
  TextRenderingService,
} from '@steggy/tty';
import { DEFAULT_LIMIT, PEAT } from '@steggy/utilities';
import chalk from 'chalk';

type tMenuOptions = MenuComponentOptions & { generateCount: number } & Record<
    'optionsLeft' | 'optionsRight',
    FakerSources
  >;
enum FakerSources {
  bikes = 'bikes',
  vin = 'vin',
  none = 'none',
  address = 'address',
  filePath = 'filePath',
  animal = 'animal',
  product = 'product',
}

@Injectable()
export class MenuSampler {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
  ) {}

  private menuOptions: tMenuOptions = {
    condensed: false,
    generateCount: DEFAULT_LIMIT,
    headerMessage: faker.lorem.lines(DEFAULT_LIMIT),
    headerPadding: 0,
    hideSearch: false,
    keyOnly: false,
    leftHeader: '',
    optionsLeft: FakerSources.animal,
    optionsRight: FakerSources.filePath,
    rightHeader: '',
    showHeaders: true,
    showHelp: true,
    sort: true,
  };

  public async exec(): Promise<void> {
    this.application.setHeader('Menu creator');
    this.menuOptions = await this.prompt.objectBuilder<tMenuOptions>({
      current: this.menuOptions,
      elements: [
        {
          name: 'Condensed',
          path: 'condensed',
          type: 'boolean',
        },
        {
          name: 'Header Padding',
          path: 'headerPadding',
          type: 'number',
        },
        {
          name: 'Hide Search',
          path: 'hideSearch',
          type: 'boolean',
        },
        {
          name: 'Key Only',
          path: 'keyOnly',
          type: 'boolean',
        },
        {
          name: 'Header Message',
          path: 'headerMessage',
          type: 'string',
        },
        {
          name: 'Left Header',
          path: 'leftHeader',
          type: 'string',
        },
        {
          name: 'Right Header',
          path: 'rightHeader',
          type: 'string',
        },
        {
          name: 'Sort',
          path: 'sort',
          type: 'boolean',
        },
        {
          extra: { options: Object.values(FakerSources) },
          name: chalk.magenta('Options left'),
          path: 'optionsLeft',
          type: 'enum',
        },
        {
          extra: { options: Object.values(FakerSources) },
          // name: 'Options right',
          name: chalk.magenta('Options right'),
          path: 'optionsRight',
          type: 'enum',
        },
        {
          name: 'Show Help',
          path: 'showHelp',
          type: 'string',
        },
        {
          name: 'Generate Options qty',
          // name: chalk.magenta('Generate Options qty'),
          path: 'generateCount',
          type: 'number',
        },
        {
          name: 'Show Headers',
          path: 'showHeaders',
          type: 'boolean',
        },
      ],
      mode: 'single',
    });
    const { optionsLeft, optionsRight, headerMessage, ...options } =
      this.menuOptions;
    const left: MainMenuEntry[] =
      optionsLeft !== FakerSources.none
        ? PEAT(DEFAULT_LIMIT).map(i =>
            this.generateMenuItem(optionsLeft, `left-${i}`),
          )
        : undefined;
    const right: MainMenuEntry[] =
      optionsRight !== FakerSources.none
        ? PEAT(DEFAULT_LIMIT).map(i =>
            this.generateMenuItem(optionsRight, `right-${i}`),
          )
        : undefined;
    const message = template(headerMessage as string);
    const result = await this.prompt.menu({
      ...options,
      headerMessage: message,
      left,
      right,
    });
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private generateMenuItem(type: FakerSources, value: unknown): MainMenuEntry {
    let label: string;
    switch (type) {
      case FakerSources.bikes:
        label = faker.vehicle.bicycle();
        break;
      case FakerSources.filePath:
        label = faker.system.filePath();
        break;
      case FakerSources.vin:
        label = faker.vehicle.vin();
        break;
      case FakerSources.product:
        label = faker.commerce.productName();
        break;
      case FakerSources.address:
        label = faker.address.streetAddress();
        break;
      case FakerSources.animal:
        const keys = Object.keys(faker.animal);
        label = faker.animal[keys[Math.floor(Math.random() * keys.length)]]();
        break;
    }
    const phrases = [
      faker.hacker.phrase(),
      faker.company.bs(),
      faker.company.catchPhrase(),
      faker.commerce.productDescription(),
    ];

    return {
      entry: [label, value],
      helpText: phrases[Math.floor(Math.random() * phrases.length)],
    };
  }
}
