import { CanFake } from '@automagical/contracts';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from '@automagical/validation';

export enum ResourcePDFLayout {
  Landscape = 'Landscape',
  Portrait = 'Portrait',
}
export enum ResourcePDFPageSize {
  Letter = 'Letter',
  Legal = 'Legal',
  Tabloid = 'Tabloid',
  Ledger = 'Ledger',
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  A3 = 'A3',
  A4 = 'A4',
  A5 = 'A5',
  A6 = 'A6',
}
export enum ResourcePDFTheme {
  Cerulean = 'Cerulean',
  Cosmo = 'Cosmo',
  Cyborg = 'Cyborg',
  Darkly = 'Darkly',
  Flatly = 'Flatly',
  Journal = 'Journal',
  Lumen = 'Lumen',
  Materia = 'Materia',
  Readable = 'Readable',
  Sandstone = 'Sandstone',
  Simplex = 'Simplex',
  Slate = 'Slate',
  Spacelab = 'Spacelab',
  Superhero = 'Superhero',
  United = 'United',
  Yeti = 'Yeti',
}

export class ResouceSettingsDTO extends CanFake {
  // #region Object Properties

  /**
   * # PDF Settings > Settings > Hide Title Bar
   *
   * True to title bar within the rendered pdf form
   */
  @IsBoolean()
  @IsOptional()
  public hideTitle?: boolean;
  /**
   * # PDF Settings > Settings > View as Plain Text
   *
   * Render the form as plain text view instead of a the default form view
   */
  @IsBoolean()
  @IsOptional()
  public viewAsHtml?: boolean;
  /**
   * # PDF Settings > Settings > PDF Layout
   */
  @IsEnum(ResourcePDFLayout)
  @IsOptional()
  public layout?: ResourcePDFLayout;
  /**
   * # PDF Settings > Settings > Printed PDF Page Size
   *
   * The page size you would like to use when rendering your PDF.
   */
  @IsEnum(ResourcePDFPageSize)
  @IsOptional()
  public pageSize?: ResourcePDFPageSize;
  /**
   * # PDF Settings > Settings > PDF Theme
   *
   * [Bootswatch](https://bootswatch.com/) theme
   */
  @IsEnum(ResourcePDFTheme)
  @IsOptional()
  public theme?: ResourcePDFTheme;
  /**
   * # PDF Settings > Templates > Footer Template
   * HTML to inject as a footer for every page of the generated PDF. Should be valid HTML markup with following classes used to inject printing values into them:
   *  - `date` - Formatted print date
   *  - `pageNumber` - Current page number
   *  - `totalPages` - Total amount of pages
   *
   * Use `{{ formatDate( dateFormat, timezone ) }}` with the moment supported date format and timezone to customize date displaying.
   * Use Base64 for images.
   */
  @IsOptional()
  @IsString()
  public footer?: string;
  /**
   * # ⚙ PDF Settings > Templates > Header Template
   * HTML to inject as a footer for every page of the generated PDF. Should be valid HTML markup with following classes used to inject printing values into them:
   *  - `date` - Formatted print date
   *  - `pageNumber` - Current page number
   *  - `totalPages` - Total amount of pages
   *
   * Use `{{ formatDate( dateFormat, timezone ) }}` with the moment supported date format and timezone to customize date displaying.
   * Use Base64 for images.
   */
  @IsOptional()
  @IsString()
  public header?: string;
  /**
   * # PDF Settings > Settings > PDF Viewer URL
   *
   * Your PDF Viewer
   *
   * @link [PDF Customer Viewer](https://help.form.io/userguide/pdf/#custom-viewer)
   */
  @IsOptional()
  @IsUrl()
  public viewer?: string;
  /**
   * # PDF Settings > Settings > PDF Margins
   *
   * Same format as CSS margins
   *
   * @example "0,0,0,0"
   */
  @IsString()
  @IsOptional()
  public margin?: string;

  // #endregion Object Properties
}
