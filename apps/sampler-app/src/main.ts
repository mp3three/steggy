/* eslint-disable radar/no-duplicate-string */
import { QuickScript } from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
  SyncLoggerService,
  TextRenderingService,
  TTYDateTypes,
  TTYFuzzyTypes,
  TTYModule,
} from '@steggy/tty';

@QuickScript({
  application: Symbol('sampler-app'),
  imports: [TTYModule],
})
export class TTYSampler {
  constructor(
    private readonly application: ApplicationManagerService,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
    private readonly logger: SyncLoggerService,
  ) {}

  public async exec(value: string): Promise<void> {
    this.application.setHeader('TTY Sampler');

    const action = await this.prompt.menu({
      condensed: true,
      hideSearch: true,
      keyMap: {
        a: ['all'],
        d: ['done'],
      },
      right: [
        { entry: ['acknowledge'] },
        { entry: ['confirm'] },
        { entry: ['date'] },
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
        return;
      case 'done':
        return;
    }
  }

  private async acknowledge(): Promise<void> {
    const action = await this.prompt.menu({
      keyMap: {
        c: ['custom text', 'custom'],
        d: ['default text', 'default'],
      },
      keyOnly: true,
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
      keyMap: {
        c: ['custom text', 'custom'],
        d: ['default'],
        s: ['custom default state', 'state'],
      },
      keyOnly: true,
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
    this.screen.print(this.text.type(result));
    await this.prompt.acknowledge();
  }

  private async date(): Promise<void> {
    const action = await this.prompt.menu({
      keyMap: {
        d: ['default'],
        f: ['custom fuzzy', 'fuzzy'],
        t: ['custom type', 'type'],
      },
      keyOnly: true,
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
    this.screen.print(this.text.type(result));
    await this.prompt.acknowledge();
  }
}
