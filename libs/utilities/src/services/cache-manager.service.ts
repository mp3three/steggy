import { Cache } from 'cache-manager';
// Because Cache collides with a nodejs variable
// Trying to import it with autocomplets is annoying
export type CacheManagerService = Cache;
