import chalk from 'chalk';

import { InquirerPrompt } from '../decorators';

export class AcknowledgePrompt extends InquirerPrompt {
  protected onInit(): void {
    this.localKeyMap = new Map([[{}, 'onEnd']]);
  }

  protected render(): void {
    if (this.status === 'answered') {
      this.screen.render(``, '');
      return;
    }
    this.screen.render(chalk`Any key to continue`, '');
  }
}
