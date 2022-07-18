/* eslint-disable radar/no-duplicate-string */
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import {
  ApplicationManagerService,
  DateEditorEditorOptions,
  MenuEntry,
  PromptService,
  ScreenService,
  TextRenderingService,
  TTYDateTypes,
  TTYFuzzyTypes,
} from '@steggy/tty';
import { PEAT } from '@steggy/utilities';
import chalk from 'chalk';

import { MenuSampler } from './menu-sampler.service';

const LIST_LENGTH = 10;

@Injectable()
export class PromptSampler {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly menuSampler: MenuSampler,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
  ) {}

  public async exec(value?: string): Promise<void> {
    this.application.setHeader('TTY Sampler');

    const action = await this.prompt.menu({
      condensed: true,
      headerMessage: [
        chalk` {yellow.bold ?} Below is a selection of the interactions provided by {bold PromptService}.`,
        chalk` This service uses pre-built widgets to gather information from the user.`,
      ].join(`\n`),
      keyMap: {
        a: ['all'],
        d: ['done'],
      },
      right: [
        {
          entry: ['acknowledge'],
          helpText: 'A basic request for interaction before continuing',
        },
        { entry: ['boolean'], helpText: 'true / false' },
        { entry: ['confirm'], helpText: 'boolean, but different' },
        {
          entry: ['date'],
          helpText: chalk`Has support for {bold chrono-node} text parsing.\nDate modes: ${[
            'date',
            'time',
            'datetime',
            'range',
          ]
            .map(i => chalk.cyan(i))
            .join(', ')}`,
        },
        {
          entry: ['lists'],
          helpText: chalk`Pick many items out of a source list.`,
        },
        {
          entry: ['menu'],
          helpText: chalk`General workhorse component. Highly configurable`,
        },
        {
          entry: ['object builder', 'builder'],
          helpText: chalk`{yellow User configurable demo WIP}.\nView it in action with {cyan date} & {cyan menu} prompts`,
        },
        { entry: ['string'], helpText: 'Request text from the user' },
      ],
      value,
    });
    switch (action) {
      case 'acknowledge':
        await this.acknowledge();
        return await this.exec(action);
      case 'boolean':
        await this.boolean();
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
        // await this.objectBuilder();
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

  private async boolean(): Promise<void> {
    const result = await this.prompt.boolean(
      'Pineapple is acceptable on pizza?',
    );
    this.screen.print(this.text.type(result));
    this.screen.printLine(result ? '' : `, it really is tho`);
    await this.prompt.acknowledge();
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
    const options = await this.prompt.objectBuilder<DateEditorEditorOptions>({
      current: {
        fuzzy: 'user',
        label: 'Enter date',
        type: 'datetime',
      },
      elements: [
        {
          extra: { options: Object.values(TTYFuzzyTypes) },
          name: 'Fuzzy',
          path: 'fuzzy',
          type: 'enum',
        },
        {
          name: 'Label',
          path: 'label',
          type: 'string',
        },
        {
          extra: { options: Object.values(TTYDateTypes) },
          name: 'Date Type',
          path: 'type',
          type: 'enum',
        },
      ],
      mode: 'single',
    });
    const result = await this.prompt.date(options);
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
    const result = await this.prompt.string('Requesting some text', undefined, {
      placeholder: 'placeholder text',
    });
    this.screen.printLine(this.text.type(result));
    await this.prompt.acknowledge();
  }
}
