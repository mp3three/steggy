import type { MongooseModuleOptions } from '@nestjs/mongoose';
import type { CipherGCMTypes } from 'crypto';

import { APP_API_SERVER, LIB_PERSISTENCE } from '../constants';
import { CreateAnnotation } from '../decorators';

const UsesConfig = CreateAnnotation(LIB_PERSISTENCE.description);
export class MongoCerts {
  // #region Object Properties

  public CA?: [string];
  public CERT?: string;
  public CRL?: [string];
  public KEY?: string;

  // #endregion Object Properties
}
export class PersistenceConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
  })
  /**
   * Used for encrypting data before going into the database
   */
  public ALGORITHM?: CipherGCMTypes | string;
  /**
   * Used for encrypting project settings
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
  })
  public DB_SECRET?: string;

  /**
   * Load certs by path / url
   */
  public MONGO_CERTS?: MongoCerts;
  /**
   * How long to make the salt for database encryption work
   */
  public SALT_LENGTH?: number;
  /**
   * Connectino options specific mongo
   */
  public mongo?: MongooseModuleOptions;

  // #endregion Object Properties
}

/**
 * Encryption key for project settings
 */
export const DB_SECRET = 'libs.persistence.DB_SECRET';
export const SALT_LENGTH = 'libs.persistence.SALT_LENGTH';
export const ALGORITHM = 'libs.persistence.ALGORITHM';
export const PERSISTENCE_CONFIG = 'libs.persistence';
/**
 * No.. like really tho. Change it
 */
export const DEFAULT_DB_SECRET = 'changeme';
export const MONGO_CONFIG = 'libs.persistence.mongo';
export const MONGO_CERTS = 'libs.persistence.MONGO_CERTS';
/**
 * TODO: CipherGCMTypes doesn't include this algorithm
 *
 * Unclear if that is a blocking issue, or just a note that it's deprecated
 */
export const DEFAULT_ALGORITHM = 'aes-256-cbc';
export const DEFAULT_SALT_LENGTH = 40;
