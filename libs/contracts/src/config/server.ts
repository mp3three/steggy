import { LIB_FORMIO_SDK, LIB_SERVER } from '../constants';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_SERVER.description);
export class ServerConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {},
    array: true,
    type: 'string',
  })
  public RESERVED_WORDS_LIST?: string[];
  @UsesConfig({
    applications: {},
    title: 'Project',
    type: {
      key: {
        title: 'Project ID',
        type: 'string',
      },
      value: {
        title: 'API Key',
        type: 'string',
      },
    },
  })
  public PROJECT_KEYS?: Record<string, string>;
  @UsesConfig({
    applications: {},
    type: 'boolean',
  })
  public COMPRESSION?: boolean;
  @UsesConfig({
    applications: {},
    type: 'password',
  })
  public ADMIN_KEY?: string;
  @UsesConfig({
    applications: {},
    type: 'password',
  })
  public PORTAL_ADMIN_KEY?: string;

  // #endregion Object Properties
}

/**
 * Encryption key for x-jwt-token
 */
export const ADMIN_KEY = `libs.${LIB_FORMIO_SDK.description}.ADMIN_KEY`;
export const COMPRESSION = `libs.${LIB_FORMIO_SDK.description}.COMPRESSION`;
export const RESERVED_WORDS_LIST = `libs.${LIB_FORMIO_SDK.description}.RESERVED_WORDS_LIST`;
export const PORTAL_ADMIN_KEY = `libs.${LIB_FORMIO_SDK.description}.PORTAL_ADMIN_KEY`;
export const PROJECT_KEYS = `libs.${LIB_FORMIO_SDK.description}.PROJECT_KEYS`;
