import { HTTP_METHODS } from '@automagical/contracts/fetch';

import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { LABEL_VALUE } from '../include';

export class DataSourceComponentFetchDTO {
  // #region Object Properties

  public authenticate: boolean;
  public forwardHeaders: boolean;
  public headers: LABEL_VALUE[];
  public method: HTTP_METHODS;
  public url: string;

  // #endregion Object Properties
}

export class DataSourceComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public allowCaching: boolean;
  public dataSrc: 'url' | 'indexdb';
  public fetch?: DataSourceComponentFetchDTO;
  public input: true;
  public persistent?: 'client-only';
  public trigger: Record<'init' | 'server', boolean>;
  public type: ComponentTypes.datasource;

  // #endregion Object Properties
}
