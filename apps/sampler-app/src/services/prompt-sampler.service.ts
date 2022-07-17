/* eslint-disable radar/no-duplicate-string */
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import {
  ApplicationManagerService,
  MenuComponentOptions,
  MenuEntry,
  PromptService,
  ScreenService,
  TextRenderingService,
  TTYDateTypes,
  TTYFuzzyTypes,
} from '@steggy/tty';
import { DEFAULT_LIMIT, PEAT } from '@steggy/utilities';
import chalk from 'chalk';

import { MenuSampler } from './menu-sampler.service';

const LIST_LENGTH = 10;
type tMenuOptions = MenuComponentOptions &
  Record<'optionsLeft' | 'optionsRight', boolean>;

@Injectable()
export class PromptSampler {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly menuSampler: MenuSampler,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
  ) {}

  private menuOptions: tMenuOptions = {
    condensed: false,
    headerMessage: faker.lorem.lines(DEFAULT_LIMIT),
    headerPadding: 0,
    hideSearch: false,
    keyOnly: false,
    leftHeader: 'Bikes',
    optionsLeft: true,
    optionsRight: true,
    rightHeader: '',
    showHeaders: true,
    showHelp: true,
  };

  public async exec(value?: string): Promise<void> {
    this.application.setHeader('TTY Sampler');

    const action = await this.prompt.menu({
      condensed: true,
      headerMessage: [
        chalk` {yellow.bold ?} High level interactions provided by {bold PromptService}`,
      ].join(`\n`),
      keyMap: {
        a: ['all'],
        d: ['done'],
      },
      right: [
        { entry: ['acknowledge'] },
        { entry: ['confirm'] },
        { entry: ['date'] },
        { entry: ['lists'] },
        { entry: ['menu'] },
        { entry: ['object builder', 'builder'] },
        { entry: ['string'] },
      ],
      value,
    });
    switch (action) {
      case 'acknowledge':
        await this.acknowledge();
        return await this.exec(action);
      case 'confirm':
        await this.confirm();
        return await this.exec(action);
      case 'date':
        await this.date();
        return await this.exec(action);
      case 'lists':
        await this.lists();
        return await this.exec(action);
      case 'builder':
        await this.objectBuilder();
        return await this.exec(action);
      case 'menu':
        await this.menuSampler.exec();
        return await this.exec(action);
      case 'string':
        await this.string();
        return await this.exec(action);

      case 'done':
        return;
    }
  }

  private async acknowledge(): Promise<void> {
    const action = await this.prompt.menu({
      condensed: true,
      right: [
        { entry: ['custom text', 'custom'] },
        { entry: ['default text', 'default'] },
      ],
    });
    switch (action) {
      case 'custom':
        const text = await this.prompt.string('Message');
        await this.prompt.acknowledge(text);
        return;
      case 'default':
        await this.prompt.acknowledge();
        return;
    }
  }

  private async confirm(): Promise<void> {
    const action = await this.prompt.menu({
      condensed: true,
      right: [
        { entry: ['custom text', 'custom'] },
        { entry: ['default'] },
        { entry: ['custom default state', 'state'] },
      ],
    });
    let result: boolean;
    switch (action) {
      case 'custom':
        const text = await this.prompt.string('Message');
        result = await this.prompt.confirm(text);
        break;
      case 'default':
        result = await this.prompt.confirm();
        break;
      case 'state':
        const state = await this.prompt.boolean('Default state');
        result = await this.prompt.confirm(undefined, state);
        break;
    }
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private async date(): Promise<void> {
    const action = await this.prompt.menu({
      condensed: true,
      right: [
        { entry: ['default'] },
        { entry: ['custom fuzzy', 'fuzzy'] },
        { entry: ['custom type', 'type'] },
      ],
    });
    let result: Date;
    switch (action) {
      case 'default':
        result = await this.prompt.date({});
        break;
      case 'fuzzy':
        const fuzzy = await this.prompt.pickOne<TTYFuzzyTypes>(
          'Fuzzy search',
          Object.values(TTYFuzzyTypes).map(i => ({ entry: [i] })),
        );
        result = await this.prompt.date({ fuzzy });
        break;
      case 'type':
        const type = await this.prompt.pickOne<TTYDateTypes>(
          'Prompt type',
          Object.values(TTYDateTypes).map(i => ({ entry: [i] })),
        );
        result = await this.prompt.date({ type });
        break;
    }
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private async lists(): Promise<void> {
    const action = await this.prompt.menu({
      condensed: true,
      right: [
        { entry: ['default'] },
        { entry: ['some selected', 'selected'] },
        { entry: ['custom label', 'label'] },
      ],
    });
    const source = PEAT(LIST_LENGTH).map(
      i => [faker.company.companyName(), `${i}`] as MenuEntry,
    );
    let result: string[];
    switch (action) {
      case 'default':
        result = await this.prompt.listBuild({
          source,
        });
        break;
      case 'selected':
        result = await this.prompt.listBuild({
          current: PEAT(LIST_LENGTH).map(
            i => [faker.science.chemicalElement().name, `${i}`] as MenuEntry,
          ),
          source,
        });
        break;
      case 'label':
        const items = await this.prompt.string('Label');
        result = await this.prompt.listBuild({ items, source });
        break;
    }
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private async objectBuilder(): Promise<void> {
    // this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private async string(): Promise<void> {
    const result = await this.prompt.string('', '', {});
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }
}
