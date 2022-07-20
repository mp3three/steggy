/* eslint-disable radar/no-duplicate-string */
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import {
  ApplicationManagerService,
  ColorsService,
  MainMenuEntry,
  MenuComponentOptions,
  PromptService,
  ScreenService,
  template,
  TextRenderingService,
} from '@steggy/tty';
import { is, PEAT, SECOND, SINGLE, sleep, TitleCase } from '@steggy/utilities';
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

type tAsyncExample = { color?: string; song?: string };
const DEFAULT_GENERATE = 50;

@Injectable()
export class MenuSampler {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly colors: ColorsService,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
  ) {}

  private menuOptions: tMenuOptions = {
    condensed: false,
    generateCount: DEFAULT_GENERATE,
    headerMessage: faker.company.catchPhrase(),
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
        { entry: ['basic'] },
        {
          entry: ['async callbacks', 'async'],
          helpText: [
            `Run code in the background, while still keeping the menu rendered.`,
            `Return response messages to console`,
          ].join(`\n`),
        },
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
    const result = await this.prompt.menu<tAsyncExample>({
      condensed: true,
      headerMessage: [
        chalk` {yellow.bold ?} highlighted items have a {yellow 1} second delay on activation.`,
        chalk.gray`Messages persist {yellow.dim 2} seconds, then are cleared on next render.`,
        chalk.gray`Renders require user interaction.`,
      ].join(`\n`),
      keyMap: {
        a: [chalk.magenta.inverse('do a little dance'), 'dance'],
        b: [chalk.magenta.inverse('paint some colors'), 'colors'],
        d: ['done'],
      },
      keyMapCallback: async (
        action,
        [label, value]: [string, tAsyncExample],
      ) => {
        if (!['dance', 'colors'].includes(action)) {
          return false;
        }
        await sleep(SECOND);
        if (action === 'dance') {
          return is.empty(value.song)
            ? chalk.red(`you are too sober to dance to colors`)
            : chalk`Dancing to {magenta ${label}}! {gray Value: ${value.song}}`;
        }

        return is.empty(value.color)
          ? chalk.cyan(`🤖 Silly human, songs aren't colors`)
          : chalk.bgHex(label)[
              this.colors.isBright(label.slice(SINGLE)) ? 'black' : 'white'
            ]`${label} is a ${faker.word.adjective()} color`;
      },
      left: PEAT(CHUNKY_LIST).map(i => ({
        entry: [faker.color.rgb(), { color: `${i}` }],
      })),
      leftHeader: 'Colors',
      right: PEAT(CHUNKY_LIST).map(i => ({
        entry: [faker.music.songName(), { song: `${i}` }],
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

  private generateMenuItem(
    labelType: FakerSources,
    value: unknown,
  ): MainMenuEntry {
    let label: string;
    let type: string = labelType;
    switch (labelType) {
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
        const keys = Object.keys(faker.animal).filter(
          i => is.function(faker.animal[i]) && !['type'].includes(i),
        );
        // faker.animal.t
        const animalType = keys[Math.floor(Math.random() * keys.length)];
        label = faker.animal[animalType]();
        type = animalType;
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
      type: TitleCase(type),
    };
  }
}
