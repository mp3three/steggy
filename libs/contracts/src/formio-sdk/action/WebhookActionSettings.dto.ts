import { HTTP_Methods } from '@automagical/fetch';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from '@automagical/validation';

/**
 * Premium Action
 */
export class WebhookActionSettingsDTO {
  // #region Object Properties

  /**
   * Additional heades
   *
   * FIXME: Wrong annotations (how can I get it to do an array of string records?)
   */
  @IsArray()
  @IsOptional()
  public headers?: Record<string, string>[];
  /**
   * Wait for webhook response before continuing actions
   */
  @IsBoolean()
  @IsOptional()
  public block: boolean;
  /**
   * ## Request Method
   *
   * What types of call the API server should initiate this webhook on
   */
  @IsEnum(HTTP_Methods)
  public method: HTTP_Methods;
  /**
   * Pass on any headers received by the API server.
   */
  @IsOptional()
  @IsBoolean()
  public forwardHeaders?: boolean;
  /**
   * ## Request URL
   *
   * The URL the request will be made to. You can interpolate the URL with data.myfield or externalId variables.
   */
  @IsString()
  public url: string;
  /**
   * When making a request to an external service, you may want to save an external Id in association with this submission so you can refer to the same external resource later.
   *
   * The path to the data in the webhook response object
   *
   * @example /path/to/value
   */
  @IsString()
  @IsOptional()
  public externalIdPath?: string;
  /**
   * When making a request to an external service, you may want to save an external Id in association with this submission so you can refer to the same external resource later.
   *
   * The name to store and reference the external Id for this request
   */
  @IsString()
  @IsOptional()
  public externalIdType?: string;
  /**
   * HTTP Basic Authentication
   */
  @IsString()
  @IsOptional()
  public password?: string;
  /**
   * Javascript code to transform the outgoing payload. Default payload:
   *
   * | Property | Description |
   * | --- | --- |
   * | request | Original request body sent to server |
   * | response | Server response |
   * | submission | The submission object |
   * | params | Query / url params from request |
   */
  @IsString()
  @IsOptional()
  public transform?: string;
  /**
   * HTTP Basic Authentication
   */
  @IsString()
  @IsOptional()
  public username?: string;

  // #endregion Object Properties
}
