import { ComponentTypes, DataSource } from '../enums';
import { RefreshOn } from '../enums/refresh-on';
import { IndexDBDTO } from '../include';
import { SelectDataCustomDTO } from '../include/select/custom.dto';
import { SelectDataJSONDTO } from '../include/select/json.dto';
import { SelectDataResourceDTO } from '../include/select/resource.dto';
import { SelectDataUrlDTO } from '../include/select/url.dto';
import { SelectDataValuesDTO } from '../include/select/values.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

type DataTypes =
  | SelectDataResourceDTO
  | SelectDataUrlDTO
  | SelectDataValuesDTO
  | SelectDataCustomDTO
  | SelectDataJSONDTO
  | Record<string, unknown>[];

export class SelectComponentDTO<
  DATA_TYPE extends DataTypes = DataTypes,
> extends BaseInputComponentDTO {
  // #region Object Properties

  public addResource?: boolean;
  public addResourceLabel?: string;
  public clearOnRefresh?: boolean;
  /**
   * The source to use for the select data. Values lets you provide your own values and labels.
   * JSON lets you provide raw JSON data.
   * URL lets you provide a URL to retrieve the JSON data from.
   */
  public data: DATA_TYPE;
  public dataSrc: DataSource;
  public filter?: string;
  /**
   * Path to the select option id.
   */
  public idPath?: string;
  public ignoreCache?: boolean;
  public indexdb?: IndexDBDTO;
  /**
   * Relevent when using SelectDataUrlDTO as data type
   */
  public lazyLoad?: boolean;
  public limit?: number;
  public readOnlyValue?: boolean;
  public reference?: boolean;
  public refreshOnBlur?: RefreshOn;
  public searchField?: string;
  public selectFields?: string;
  public selectThreshold?: number;
  public sort?: string;
  public template?: string;
  public declare type: ComponentTypes.select;
  /**
   * Display only unique dropdown options.
   */
  public uniqueOptions?: boolean;
  public useExactSearch?: boolean;
  public valueProperty?: string;
  public widget?: 'html5' | 'choicesjs';

  // #endregion Object Properties
}
