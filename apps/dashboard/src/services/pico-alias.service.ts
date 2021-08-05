import { BLESSED_SCREEN } from '@automagical/contracts/terminal';
import { Inject, Injectable } from '@nestjs/common';
import { Widgets } from 'blessed';
import { grid as Grid, Widgets as ContribWidgets } from 'blessed-contrib';

@Injectable()
export class PicoAliasService {
  // #region Object Properties

  private WIDGET: ContribWidgets.GridElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async attachInstance(grid: Grid): Promise<void> {
    // this.WIDGET = grid.set(0, 0, 3, 1, Grid, {
    //   label: 'Pico Alias',
    //   cols: 1,
    // } as ContribWidgets.GridOptions);
    // this.WIDGET.set()
    // const button = Button({
    //   bg: 'yellow',
    //   border: 'line',
    //   content: 'button',
    //   height: '20%',
    //   parent: this.WIDGET,
    //   tags: true,
    // });

    // const cache = await this.cacheManager.get<HassEventDTO[]>(CACHE_KEY);
    // cache.forEach((event) => {
    //   this.BOX.insertLine(0, this.buildLine(event));
    // });
    this.SCREEN.render();
  }

  // #endregion Public Methods
}
