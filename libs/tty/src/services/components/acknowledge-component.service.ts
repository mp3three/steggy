import { Component, iComponent } from '../../decorators';
import { KeyboardManagerService, ScreenService } from '../meta';

@Component({ type: 'acknowledge' })
export class AcknowledgeComponentService implements iComponent {
  constructor(
    private readonly screenService: ScreenService,
    private readonly keyboardService: KeyboardManagerService,
  ) {}

  private done: () => void;

  public configure(config, callback): void {
    this.done = callback;
    this.keyboardService.setKeyMap(this, new Map([[{}, 'complete']]));
  }

  public render(): void {
    this.screenService.print(`Any key to continue`);
  }

  protected complete(): void {
    this.done();
  }
}
