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
import { DEFAULT_LIMIT, is, PEAT } from '@steggy/utilities';
import chalk from 'chalk';

type tMenuOptions = MenuComponentOptions & { generateCount: number } & Record<
    'optionsLeft' | 'optionsRight',
    FakerSources
  >;
const CHUNKY_LIST = 50;

/**
 * Just a few items to make life interesting
 */
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
    hideSearch: false,
    keyOnly: false,
    leftHeader: '',
    optionsLeft: FakerSources.animal,
    optionsRight: FakerSources.filePath,
    rightHeader: '',
    showHeaders: true,
    showHelp: true,
  };

  public async exec(): Promise<void> {
    this.application.setHeader('Menu Sampler');
    const action = await this.prompt.menu({
      right: [
        {
          entry: ['async callbacks', 'async'],
          helpText: [
            `Run code in the background, while still keeping the menu rendered.`,
            `Return response messages to console`,
          ].join(`\n`),
        },
        { entry: ['basic'] },
      ],
    });
    switch (action) {
      case 'basic':
        await this.basic();
        return;
      case 'async':
        await this.async();
        return;
    }
  }

  private async async(): Promise<void> {
    const result = await this.prompt.menu({
      condensed: true,
      keyMap: {
        a: [chalk.magenta.inverse('do a little dance'), 'dance'],
        b: [chalk.magenta.inverse('paint some colors'), 'colors'],
        d: ['done'],
      },
      keyMapCallback(action, [label, value]) {
        if (!['dance', 'colors'].includes(action)) {
          return false;
        }
        return `${label} clicked (${value})`;
      },
      left: PEAT(CHUNKY_LIST).map(i => ({
        entry: [faker.color.rgb(), `${i}`],
      })),
      leftHeader: 'Colors',
      right: PEAT(CHUNKY_LIST).map(i => ({
        entry: [faker.music.songName(), `${i}`],
      })),
      rightHeader: 'Songs',
    });
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private async basic(): Promise<void> {
    this.menuOptions = await this.prompt.objectBuilder<tMenuOptions>({
      current: this.menuOptions,
      elements: [
        {
          name: 'Condensed',
          path: 'condensed',
          type: 'boolean',
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
          name: 'Show Help',
          path: 'showHelp',
          type: 'boolean',
        },
        {
          name: 'Show Headers',
          path: 'showHeaders',
          type: 'boolean',
        },
        {
          extra: { options: Object.values(FakerSources) },
          name: chalk.cyan('Options left'),
          path: 'optionsLeft',
          type: 'enum',
        },
        {
          extra: { options: Object.values(FakerSources) },
          name: chalk.cyan('Options right'),
          path: 'optionsRight',
          type: 'enum',
        },
        {
          name: chalk.cyan('Generate Options qty'),
          path: 'generateCount',
          type: 'number',
        },
      ],
      mode: 'single',
    });
    const {
      optionsLeft,
      optionsRight,
      headerMessage,
      generateCount,
      ...options
    } = this.menuOptions;
    const left: MainMenuEntry[] =
      optionsLeft !== FakerSources.none
        ? PEAT(generateCount).map(i =>
            this.generateMenuItem(optionsLeft, `left-${i}`),
          )
        : undefined;
    const right: MainMenuEntry[] =
      optionsRight !== FakerSources.none
        ? PEAT(generateCount).map(i =>
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
        const keys = Object.keys(faker.animal).filter(i =>
          is.function(faker.animal[i]),
        );
        const type = keys[Math.floor(Math.random() * keys.length)];
        label = faker.animal[type]();
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
