import { MongooseModuleOptions } from '@nestjs/mongoose';
import { CipherGCMTypes } from 'crypto';

export class PersistenceConfig {
  // #region Object Properties

  public ALGORITHM?: CipherGCMTypes | string;
  public DB_SECRET?: string;
  public connections?: {
    submission: MongooseModuleOptions;
  };

  // #endregion Object Properties
}

/**
 * Encryption key for x-jwt-token
 */
export const DB_SECRET = 'libs.persistence.DB_SECRET';
export const ALGORITHM = 'libs.persistence.ALGORITHM';
export const PERSISTENCE_CONFIG = 'libs.persistence';
export const DEFAULT_DB_SECRET = 'changeme';
