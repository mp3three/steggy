/**
 * Words that are NOT allowed to be used for names of dynamic objects
 *
 * Words that collide with routes / domains / internal logic.
 * This can be appended to at config time
 */
export const RESERVED_WORDS = new Set([
  'status',
  'role',
  'status',
  'test',
  'www',
  'api',
  'health',
  'help',
  'support',
  'portal',
  'app',
  'apps',
  'classic',
  'token',
  'favicon.ico',
  'form',
  'beta',
  'action',
  'project',
  'storage',
  'dropbox',
  'atlassian',
  'available',
  'analytics',
  'spec.json',
  'team',
  'files',
  'pdf',
  'manager',
  'cdn',
  'alpha',
  'gamma',
  'localhost',
]);
