import {
  AutoLogService,
  LOG_CONTEXT,
  ModuleScannerService,
} from '@steggy/boilerplate';
import {
  CustomCommandDTO,
  RoutineCommandDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';

import {
  CUSTOM_COMMAND,
  CustomCommandOptions,
  iRoutineCommand,
  RoutineCommand,
  tCustomCommandMap,
  tCustomCommandMapItem,
} from '../decorators';

@RoutineCommand({
  description: 'Execute an in-code binding',
  name: 'Custom Function',
  type: 'custom_command',
})
export class CustomCommandService implements iRoutineCommand<CustomCommandDTO> {
  constructor(
    private readonly logger: AutoLogService,
    private readonly moduleScanner: ModuleScannerService,
  ) {}

  private COMMAND_LIST: Map<CustomCommandOptions, tCustomCommandMap>;

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<CustomCommandDTO>;
    routine: RoutineDTO;
    runId: string;
    waitForChange: boolean;
  }): Promise<void | boolean> {
    const [target] =
      [...this.COMMAND_LIST.entries()].find(([, map]) => {
        let found = false;
        map.forEach(({ target }) => {
          found ||= target.constructor[LOG_CONTEXT] === command.command.context;
        });
        return found;
      }) ?? [];
    if (!target) {
      this.logger.error(
        `[${command.command.context}] could not locate context`,
      );
      return;
    }

    if (!is.function(target[command.command.method])) {
      this.logger.error(
        `${target.constructor[LOG_CONTEXT]}#${command.command.method} is not a function`,
      );
      return;
    }
    return await target[command.command.method]();
  }

  public listCommands(): unknown[] {
    return [...this.COMMAND_LIST.entries()].map(([item, map]) => {
      const entry = [...map.values()].find(
        ({ options }) => options === item,
      ) as tCustomCommandMapItem;
      return {
        ...entry.options,
        context: entry.target.constructor[LOG_CONTEXT],
        property: entry.property,
      };
    });
  }

  protected onModuleInit(): void {
    this.COMMAND_LIST = this.moduleScanner.findWithSymbol<
      tCustomCommandMap,
      CustomCommandOptions
    >(CUSTOM_COMMAND);
    if (is.empty(this.COMMAND_LIST)) {
      this.logger.info(`Loaded {${this.COMMAND_LIST.size}} custom commands`);
      return;
    }
    this.logger.info(`Loaded {${this.COMMAND_LIST.size}} custom commands`);
    this.COMMAND_LIST.forEach(provider => {
      provider.forEach(({ target, property }, options) =>
        this.logger.debug(
          ` - ${target.constructor[LOG_CONTEXT]}#${property} {${options.friendlyName}}`,
        ),
      );
    });
  }
}
