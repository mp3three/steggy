import { CreateConfigurableAnnotation } from '@automagical/utilities';

import { LIB_HOME_ASSISTANT } from '../constants';

const UsesConfig = CreateConfigurableAnnotation(LIB_HOME_ASSISTANT.description);
export class HomeAssistantConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {},
    type: 'url',
  })
  public BASE_URL?: string;
  @UsesConfig({
    applications: {},
    type: 'number',
  })
  public DBL_CLICK_TIMEOUT?: number;
  @UsesConfig({
    applications: {},
    type: 'url',
  })
  public HOST?: string;
  @UsesConfig({
    applications: {},
    type: 'password',
  })
  public TOKEN?: string;

  // #endregion Object Properties
}
export const HOME_ASSISTANT_BASE_URL = `libs.${LIB_HOME_ASSISTANT.description}.BASE_URL`;
export const HOME_ASSISTANT_HOST = `libs.${LIB_HOME_ASSISTANT.description}.HOST`;
export const HOME_ASSISTANT_TOKEN = `libs.${LIB_HOME_ASSISTANT.description}.TOKEN`;
export const DBL_CLICK_TIMEOUT = `libs.${LIB_HOME_ASSISTANT.description}.DBL_CLICK_TIMEOUT`;
