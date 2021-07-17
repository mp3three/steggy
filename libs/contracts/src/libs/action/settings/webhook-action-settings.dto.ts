import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { HTTP_METHODS } from '../../fetch';

/**
 * Premium Action
 */
export class WebhookActionSettingsDTO {
  // #region Object Properties

  /**
   * Headers to merge
   */
  @IsArray()
  @IsOptional()
  public headers?: Record<'header' | 'value', string>[];
  /**
   * Wait for webhook response before continuing actions
   */
  @IsBoolean()
  @IsOptional()
  public block: boolean;
  /**
   * ## Request Method
   *
   * What types of call the API server should activate with
   */
  @IsEnum(HTTP_METHODS)
  public method: HTTP_METHODS;
  /**
   * Pass on any headers received by the API server.
   */
  @IsOptional()
  @IsBoolean()
  public forwardHeaders?: boolean;
  @IsString()
  public title: string;
  /**
   * ## Request URL
   *
   * The URL for the request. You can interpolate the URL with data.myfield or externalId variables.
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
