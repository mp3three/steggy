import { is } from '@steggy/utilities';
import { homedir } from 'os';
import { join } from 'upath';

export function LoadCustomCode() {
  const IS_USER_ENVIRONMENT = Object.keys(process.env).some(key =>
    key.startsWith('XDG'),
  );
  if (IS_USER_ENVIRONMENT) {
    LoadUserEnvironment();
    return;
  }
  LoadDeployed();
}

/**
 * The system has passed additional user environment information.
 * Do all the work to attempt to find code to load
 */
function LoadUserEnvironment() {
  const BASE_DIR = !is.empty(process.env.XDG_STATE_HOME)
    ? process.env.XDG_STATE_HOME
    : join(homedir(), '.local', 'share', '');
}

/**
 * For use with deployed containers, and other spots where the system user is not relevant
 */
function LoadDeployed() {
  //
}
