import { HTTP_METHODS } from '@automagical/utilities';

import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { LABEL_VALUE } from '../include';

export class DataSourceComponentFetchDTO {
  public authenticate: boolean;
  public forwardHeaders: boolean;
  public headers: LABEL_VALUE[];
  public method: HTTP_METHODS;
  public url: string;
}

export class DataSourceComponentDTO extends BaseComponentDTO {
  public allowCaching: boolean;
  public dataSrc: 'url' | 'indexdb';
  public fetch?: DataSourceComponentFetchDTO;
  public declare input: true;
  public persistent?: 'client-only';
  public trigger: Record<'init' | 'server', boolean>;
  public declare type: ComponentTypes.datasource;
}
