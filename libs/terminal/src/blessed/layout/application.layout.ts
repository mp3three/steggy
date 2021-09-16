import {
  BLESSED_SCREEN,
  BLESSED_THEME,
  BlessedThemeDTO,
  BoxElement,
  GridLayoutOptions,
  GridPosition,
  Screen,
} from '@automagical/terminal';
import { Inject, Injectable } from '@nestjs/common';

const widgetSpacing = 0;

@Injectable()
export class ApplicationLayout {
  

  private cellHeight: number;
  private cellWidth: number;
  private dashboardMargin: number;
  private settings: GridLayoutOptions;

  

  

  constructor(@Inject(BLESSED_SCREEN) private readonly SCREEN: Screen) {}

  

  

  public add(
    position: GridPosition,
    object: (position: Partial<BoxElement>) => BoxElement,
  ): void {
    const item = object({
      height: this.cellHeight * position.height - widgetSpacing + '%',
      left: `${position.x * this.cellWidth + this.dashboardMargin}%`,
      top: `${position.y * this.cellHeight + this.dashboardMargin}%`,
      width: this.cellWidth * position.width - widgetSpacing + '%',
    });
    this.SCREEN.append(item);

    if (!this.settings.hideBorder) {
      item.border = { fg: 15, type: 'line' };
    }

    // this.SCREEN.append(object);
    this.SCREEN.render();
  }

  public init(settings: GridLayoutOptions): void {
    this.settings = settings;
    const { cols, rows, dashboardMargin } = settings;
    this.dashboardMargin = dashboardMargin ?? 0;
    this.cellWidth = (100 - dashboardMargin * 2) / cols;
    this.cellHeight = (100 - dashboardMargin * 2) / rows;
  }

  
}

// +--------------------+---------------------------------------------------------------+
// |  LEFT PANEL        |   MAIN SECTION                                                |
// |                    |                                                               |
// |     <- 25% ->      |   < - 75% ->                                                  |
// |                    |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// |  Main main         |                                                               |
// |  Sidebar           |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// |                    |                                                               |
// +--------------------+---------------------------------------------------------------+
