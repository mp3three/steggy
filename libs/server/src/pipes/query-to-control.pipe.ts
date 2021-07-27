import { ResultControlDTO } from '@automagical/contracts/utilities';
import { queryToControl } from '@automagical/utilities';
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QueryToControlPipe implements PipeTransform {
  // #region Public Methods

  public transform(value: Record<string, string>): ResultControlDTO {
    return queryToControl(value as Record<string, string>);
  }

  // #endregion Public Methods
}
