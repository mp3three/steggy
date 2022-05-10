import { Component, iComponent } from '../../decorators';
import { KeyboardManagerService, ScreenService } from '../meta';

@Component({ type: 'confirm' })
export class ConfirmComponentService implements iComponent {
  constructor(
    private readonly screenService: ScreenService,
    private readonly keyboardService: KeyboardManagerService,
  ) {}

  private complete = false;
  private done: (state: boolean) => void;
  private initialState = false;
  private message = ``;

  public configure(
    config: {
      defaultValue?: boolean;
      message?: string;
    },
    callback,
  ): void {
    this.complete = false;
    this.done = callback;
    this.message = config.message;
    this.initialState = config.defaultValue;
    this.keyboardService.setKeyMap(
      this,
      new Map([
        [{ key: 'y' }, 'accept'],
        [{ key: 'n' }, 'deny'],
      ]),
    );
  }

  public render(): void {
    if (this.complete) {
      return;
    }
    this.screenService.print(
      `${this.message} (${this.initialState ? 'Y/n' : 'y/N'})`,
    );
  }

  protected accept(): void {
    this.complete = true;
    this.done(true);
  }

  protected deny(): void {
    this.complete = true;
    this.done(false);
  }
}
