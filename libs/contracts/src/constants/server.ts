export const JWT_HEADER = 'x-jwt-token';
export const API_KEY_HEADER = 'x-token';
export const LICENSE_KEY_HEADER = 'x-license-key';
export const REMOTE_TOKEN_HEADER = 'x-remote-token';
export const ADMIN_KEY_HEADER = 'x-admin-key';
export const FOWARD_AUTH_HEADER = 'forward-auth';
export const AUTHENTICATION_HEADER = 'authentication';

/**
 * Words that are NOT allowed to be used for names of dynamic objects
 *
 * Words that collide with routes / domains / internal logic
 */
export const RESERVED_WORDS = new Set([
  'status',
  'role',
  'api-server',
  'status',
  'test',
  'www',
  'api',
  'help',
  'support',
  'portal',
  'app',
  'apps',
  'classic',
  'token',
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
