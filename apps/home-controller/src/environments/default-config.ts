import { AbstractConfig } from '@steggy/boilerplate';
import { GLOBAL_PREFIX, LIB_SERVER } from '@steggy/server';

export const DEFAULT_CONFIG: AbstractConfig = {
  libs: { [LIB_SERVER.description]: { [GLOBAL_PREFIX]: '/api' } },
};
