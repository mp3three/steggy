import { HassEventDTO } from '@automagical/contracts/home-assistant';
import { Box, BoxElement, GridElement } from '@automagical/contracts/terminal';
import { RefreshAfter } from '@automagical/terminal';
import { CacheManagerService, InjectCache } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

// const BOX_SETTINGS: Widgets.BoxOptions = {
//   alwaysScroll: true,
//   keys: true,
//   scrollable: true,
//   scrollbar: {
//     style: {
//       bg: 'yellow',
//     },
//   },
//   tags: true,
//   valign: 'bottom',
// };

@Injectable()
export class StatusService {
  // #region Object Properties

  private WIDGET: BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectCache() private readonly cacheManager: CacheManagerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @RefreshAfter()
  public async attachInstance(grid: GridElement): Promise<void> {
    this.WIDGET = grid.set(0, 0, 3, 1, Box, {
      label: 'Quick Status',
    });
    const cache = await this.cacheManager.get<HassEventDTO[]>(CACHE_KEY);
    cache.forEach((event) => {
      this.WIDGET.insertLine(0, this.buildLine(event));
    });
  }

  // #endregion Public Methods

  // #region Private Methods

  private buildLine(event: HassEventDTO): string {
    return event.data.entity_id;
  }

  // #endregion Private Methods
}
const CACHE_KEY = StatusService.name;
