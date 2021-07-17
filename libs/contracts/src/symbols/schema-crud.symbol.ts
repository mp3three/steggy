import { SCHEMA_KEYS } from '../libs/persistence/schema';

export interface SchemaCRUD {
  // #region Public Methods

  create(key: SCHEMA_KEYS, value: string): Promise<string>;
  find(key: SCHEMA_KEYS): Promise<string>;
  update(key: SCHEMA_KEYS, value: string): Promise<string>;

  // #endregion Public Methods
}
// update(
//   source: SchemaDTO | string,
//   update: Omit<Partial<SchemaDTO>, '_id' | 'created'>,
// ): Promise<boolean>;
export const SchemaCRUD = Symbol('SchemaCRUD');
export type iSchemaCRUD = SchemaCRUD;
