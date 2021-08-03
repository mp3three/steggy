import {
  BLESSED_SCREEN,
  BLESSED_THEME,
  BlessedThemeDTO,
  GridLayoutOptions,
  GridPosition,
} from '@automagical/contracts/terminal';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Widgets } from 'blessed';

const widgetSpacing = 0;

@Injectable({ scope: Scope.TRANSIENT })
export class GridLayout {
  // #region Object Properties

  private cellHeight: number;
  private cellWidth: number;
  private dashboardMargin: number;
  private settings: GridLayoutOptions;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
    @Inject(BLESSED_THEME) private readonly theme: BlessedThemeDTO,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public add(
    position: GridPosition,
    object: (position: Partial<Widgets.BoxElement>) => Widgets.BoxElement,
  ): void {
    this.SCREEN.append(
      object({
        height: this.cellHeight * position.height - widgetSpacing + '%',
        left: `${position.x * this.cellWidth + this.dashboardMargin}%`,
        top: `${position.y * this.cellHeight + this.dashboardMargin}%`,
        width: this.cellWidth * position.width - widgetSpacing + '%',
      }),
    );

    if (!this.settings.hideBorder) {
      object.border = { fg: 15, type: 'line' };
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

  // #endregion Public Methods
}
