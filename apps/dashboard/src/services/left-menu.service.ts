import { Inject } from '@nestjs/common';

import { BLESSED_GRID, GridElement } from '../typings';

export class LeftMenuService {
  // #region Constructors

  constructor(@Inject(BLESSED_GRID) private readonly grid: GridElement) {}

  // #endregion Constructors
}
