import { LIB_PORTAINER } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_PORTAINER.description);
export class PortainerConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {},
    type: 'password',
  })
  public TOKEN?: string;
  @UsesConfig({
    applications: {},
    type: 'url',
  })
  public BASE_URL?: string;

  // #endregion Object Properties
}

/**
 * The URL for your home assistant instance
 */
export const PORTAINER_BASE_URL = `libs.${LIB_PORTAINER.description}.BASE_URL`;
/**
 * Authorization token for home assistant
 */
export const PORTAINER_TOKEN = `libs.${LIB_PORTAINER.description}.TOKEN`;
