import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DOWN, is, LABEL, UP, VALUE } from '@steggy/utilities';
import chalk from 'chalk';

import {
  ListBuilderOptions,
  MenuComponentOptions,
  ToMenuEntry,
} from '../components';
import {
  MainMenuEntry,
  PromptMenuItems,
  TableBuilderOptions,
} from '../contracts';
import {
  DateEditorEditorOptions,
  NumberEditorRenderOptions,
  StringEditorRenderOptions,
} from '../editors';
import { ApplicationManagerService, SyncLoggerService } from './meta';

export type PROMPT_WITH_SHORT = { name: string; short: string };
export type PromptEntry<T = string> =
  | [string | PROMPT_WITH_SHORT, string | T]
  | [string];
const DEFAULT_WIDTH = 50;

@Injectable()
export class PromptService {
  constructor(
    private readonly logger: SyncLoggerService,
    @Inject(forwardRef(() => ApplicationManagerService))
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  /**
   * Force a user interaction before continuing
   *
   * Good for giving the user time to read a message before a screen clear happens
   */
  public async acknowledge(message?: string): Promise<void> {
    await this.applicationManager.activateComponent('acknowledge', { message });
  }

  public async boolean(
    message: string,
    defaultValue?: boolean,
  ): Promise<boolean> {
    return (await this.menu({
      condensed: true,
      headerMessage: chalk`  {green ?} ${message}`,
      hideSearch: true,
      right: ToMenuEntry([
        ['true', true],
        ['false', false],
      ]),
      value: defaultValue,
    })) as boolean;
  }

  /**
   * For solving ternary spread casting madness more easily
   *
   * More for helping code read top to bottom more easily than solving a problem
   */
  public conditionalEntries<T extends unknown = string>(
    test: boolean,
    trueValue: PromptEntry<T>[] = [],
    falseValue: PromptEntry<T>[] = [],
  ): PromptEntry<T>[] {
    if (test) {
      return trueValue;
    }
    return falseValue;
  }

  public async confirm(
    message = `Are you sure?`,
    defaultValue = false,
  ): Promise<boolean> {
    return await this.applicationManager.activateComponent('confirm', {
      defaultValue,
      message,
    });
  }

  public async date<T extends Date | [Date, Date] = Date>({
    current,
    label,
    ...options
  }: DateEditorEditorOptions = {}): Promise<T> {
    const result = await this.applicationManager.activateEditor<
      DateEditorEditorOptions,
      string
    >('date', {
      current,
      label,
      ...options,
    });
    if (Array.isArray(result)) {
      return result.map(i => new Date(i)) as T;
    }
    return new Date(result) as T;
  }

  public async dateRange({
    current,
    label,
    ...options
  }: DateEditorEditorOptions = {}): Promise<{ from: Date; to: Date }> {
    const [from, to] = await this.applicationManager.activateEditor<
      DateEditorEditorOptions,
      string[]
    >('date', {
      current,
      label,
      ...options,
    });
    return { from: new Date(from), to: new Date(to) };
  }

  // /**
  //  * @deprecated
  //  */
  // public async editor(message: string, defaultValue?: string): Promise<string> {
  //   const { result } = await inquirer.prompt([
  //     {
  //       default: defaultValue,
  //       message,
  //       name,
  //       type: 'editor',
  //     },
  //   ]);
  //   return result.trim();
  // }

  public itemsFromEntries<T extends unknown = string>(
    items: PromptEntry<T>[],
    extendedShort = false,
  ): PromptMenuItems<T> {
    return items.map(item => {
      if (Array.isArray(item)) {
        const label = item[LABEL] as string | PROMPT_WITH_SHORT;
        return is.string(label)
          ? {
              // Adding emoji can sometimes cause the final character to have rendering issues
              // Insert sacrificial empty space to the end
              name: `${label} `,
              short: `${label}${extendedShort ? ' ' : ''}`,
              value: item[VALUE] as T,
            }
          : {
              ...(label as PROMPT_WITH_SHORT),
              value: item[VALUE] as T,
            };
      }
      return item;
    });
  }

  public async listBuild<T>(options: ListBuilderOptions<T>): Promise<T[]> {
    const result = await this.applicationManager.activateComponent<
      ListBuilderOptions<T>,
      T[]
    >('list', options);
    return result;
  }

  public async menu<T extends unknown = string>(
    options: MenuComponentOptions<T | string>,
  ): Promise<T | string> {
    options.keyMap ??= {};
    const result = await this.applicationManager.activateComponent<
      MenuComponentOptions,
      T
    >('menu', options);
    return result;
  }

  public async number(
    label = `Number value`,
    current?: number,
    options: Omit<NumberEditorRenderOptions, 'label' | 'current'> = {},
  ): Promise<number> {
    return await this.applicationManager.activateEditor('number', {
      current,
      label,
      width: DEFAULT_WIDTH,
      ...options,
    } as NumberEditorRenderOptions);
  }

  public async objectBuilder<T>(options: TableBuilderOptions<T>): Promise<T> {
    const result = await this.applicationManager.activateComponent<
      TableBuilderOptions<T>,
      T
    >('table', options);
    return result;
  }

  /**
   * @deprecated
   */
  public async password(
    label = `Password value`,
    defaultValue?: string,
  ): Promise<string> {
    // const { result } = await inquirer.prompt([
    //   {
    //     default: defaultValue,
    //     message,
    //     name,
    //     type: 'password',
    //   },
    // ]);
    // return result;
    return await this.string(label, defaultValue, {
      //
    });
  }

  public async pickOne<T extends unknown = string>(
    message = `Pick one`,
    options: MainMenuEntry<T>[],
    defaultValue?: string | T,
  ): Promise<T> {
    if (is.empty(options)) {
      this.logger.warn(`No choices to pick from`);
      return undefined;
    }
    const cancel = Symbol();
    const result = (await this.menu({
      keyMap: { f4: ['Cancel', cancel as T] },
      right: options,
      rightHeader: message,
      value: defaultValue,
    })) as T;
    if (result === cancel) {
      return defaultValue as T;
    }
    return result;
  }

  public sort<T>(entries: PromptEntry<T>[]): PromptEntry<T>[] {
    return entries.sort((a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b)) {
        return DOWN;
      }
      return a[LABEL] > b[LABEL] ? UP : DOWN;
    });
  }

  public async string(
    label = `String value`,
    current?: string,
    options: Omit<StringEditorRenderOptions, 'label' | 'current'> = {},
  ): Promise<string> {
    return await this.applicationManager.activateEditor('string', {
      current,
      label,
      width: DEFAULT_WIDTH,
      ...options,
    } as StringEditorRenderOptions);
  }

  /**
   * @deprecated
   */
  public async time(
    label = `Time value`,
    defaultValue = new Date(),
  ): Promise<Date> {
    return await this.date({
      current: defaultValue.toISOString(),
      label,
      type: 'time',
    });
  }
}
