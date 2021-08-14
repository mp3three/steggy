import { APP_DASHBOARD, APP_HOME_CONTROLLER, LIB_HOME_ASSISTANT } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_HOME_ASSISTANT.description);
export class HomeAssistantConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
      [APP_DASHBOARD.description]: 'default',
    },
    type: 'password',
  })
  public TOKEN?: string;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
      [APP_DASHBOARD.description]: 'default',
    },
    type: 'url',
  })
  public BASE_URL?: string;

  // #endregion Object Properties
}
export const HOME_ASSISTANT_BASE_URL = `libs.${LIB_HOME_ASSISTANT.description}.BASE_URL`;
export const HOME_ASSISTANT_TOKEN = `libs.${LIB_HOME_ASSISTANT.description}.TOKEN`;
