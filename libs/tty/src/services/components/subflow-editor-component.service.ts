import { SubflowEditorOptions } from '../../contracts';
import { Component, iComponent } from '../../decorators';
import {
  ApplicationManagerService,
  KeyboardManagerService,
  ScreenService,
} from '../meta';
import { KeymapService } from '../render';

@Component({ type: 'subflow-editor' })
export class SubflowEditorComponentService<VALUE = unknown>
  implements iComponent<SubflowEditorOptions, VALUE>
{
  constructor(
    private readonly screenService: ScreenService,
    private readonly keyboardService: KeyboardManagerService,
    private readonly keymapService: KeymapService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  private done: (type: VALUE) => void;

  public configure(
    config: SubflowEditorOptions,
    done: (type: VALUE) => void,
  ): void {
    this.done = done;
  }

  public render(): void {
    //
  }
}
