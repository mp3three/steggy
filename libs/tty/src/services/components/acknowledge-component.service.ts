import chalk from 'chalk';

import { Component, iComponent } from '../../decorators';
import { KeyboardManagerService, ScreenService } from '../meta';

@Component({ type: 'acknowledge' })
export class AcknowledgeComponentService implements iComponent {
  constructor(
    private readonly screenService: ScreenService,
    private readonly keyboardService: KeyboardManagerService,
  ) {}

  private done: () => void;
  private message: string;

  public configure(config: { message: string }, callback): void {
    this.done = callback;
    this.message = config.message;
    this.keyboardService.setKeyMap(this, new Map([[{}, 'complete']]));
  }

  public render(): void {
    this.screenService.print(this.message ?? chalk.bold`Any key to continue`);
  }

  protected complete(): void {
    this.done();
  }
}
