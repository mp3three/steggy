import { Injectable } from '@nestjs/common';
import clear from 'clear';

@Injectable()
export class FormattingService {
  // #region Public Methods

  public clear(): void {
    clear();
  }

  // #endregion Public Methods
}
