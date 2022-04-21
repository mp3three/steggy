import { Cache } from 'cache-manager';
// Because Cache collides with a nodejs variable
// Trying to import it with autocomplete is annoying

/**
 * Use with `@InjectCache()`
 */
export type CacheManagerService = Cache;
// TODO: Better warning suppression
export const CacheManagerService = undefined;
