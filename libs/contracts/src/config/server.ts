import { APP_API_SERVER, LIB_SERVER } from '../constants';
import { CreateAnnotation } from '../decorators';

const UsesConfig = CreateAnnotation(LIB_SERVER.description);
export class ServerConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    type: 'password',
  })
  public ADMIN_KEY?: string;
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
    record: {
      key: 'Project ID',
      value: 'API Key',
    },
    type: 'record',
    what: 'Project',
  })
  public PROJECT_KEYS?: Record<string, string>;
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
    type: 'array',
  })
  public RESERVED_WORDS_LIST?: string[];
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
    type: 'password',
  })
  public PORTAL_ADMIN_KEY?: string;
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'hidden',
    },
    type: 'boolean',
  })
  public COMPRESSION?: boolean;

  // #endregion Object Properties
}

/**
 * Encryption key for x-jwt-token
 */
export const ADMIN_KEY = 'libs.server.ADMIN_KEY';
export const COMPRESSION = 'libs.serve.COMPRESSION';
export const RESERVED_WORDS_LIST = 'libs.server.RESERVED_WORDS_LIST';
export const PORTAL_ADMIN_KEY = 'libs.server.PORTAL_ADMIN_KEY';
export const PROJECT_KEYS = 'libs.server.PROJECT_KEYS';
