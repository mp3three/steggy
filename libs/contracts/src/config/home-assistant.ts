import { APP_DASHBOARD, APP_HOME_CONTROLLER, LIB_HOME_ASSISTANT } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_HOME_ASSISTANT.description);
export class HomeAssistantConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'required',
      [APP_DASHBOARD.description]: 'required',
    },
    type: 'password',
  })
  public TOKEN?: string;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'required',
      [APP_DASHBOARD.description]: 'required',
    },
    type: 'url',
  })
  public BASE_URL?: string;

  // #endregion Object Properties
}

/**
 * The URL for your home assistant instance
 */
export const HOME_ASSISTANT_BASE_URL = `libs.${LIB_HOME_ASSISTANT.description}.BASE_URL`;
/**
 * Authorization token for home assistant
 */
export const HOME_ASSISTANT_TOKEN = `libs.${LIB_HOME_ASSISTANT.description}.TOKEN`;
