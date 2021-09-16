import {
  BLESSED_SCREEN,
  List,
  ListElement,
  ListOptions,
  Screen,
  TreeWidgetSettingsDTO,
} from '@automagical/terminal';
import { FillDefaults, Trace } from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable({ scope: Scope.TRANSIENT })
export class TreeWidget {
  

  private height: number;
  private list: ListElement;
  private options: TreeWidgetSettingsDTO;
  private width: number;

  

  

  constructor(@Inject(BLESSED_SCREEN) private readonly SCREEN: Screen) {}

  

  

  @Trace()
  @FillDefaults(TreeWidgetSettingsDTO)
  public init(options: TreeWidgetSettingsDTO, listOptions: ListOptions): void {
    this.options = plainToClass(TreeWidgetSettingsDTO, options, {
      exposeDefaultValues: true,
    });
    this.list = List({
      left: 1,
      selectedFg: 'black',
      selectedbg: 'blue',
      top: 1,
      width: 1,
      ...listOptions,
    });
  }

  public focus(): void {
    this.list.focus();
  }

  public render(): void {
    if (this.SCREEN.focused === this.list) {
      this.list.focus();
    }
    this.list.width = this.width - 3;
    this.list.height = this.height - 3;
    // Box.prototype.render.call(this);
  }

  
}
