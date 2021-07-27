import { APP_HOME_CONTROLLER, LIB_CUSTOM } from '../constants';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_CUSTOM.description);
export const DEFAULT_CIRCADIAN_MIN_TEMP = 2500;
export const DEFAULT_CIRCADIAN_MAX_TEMP = 6000;

export class CustomLogicConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    default: DEFAULT_CIRCADIAN_MAX_TEMP,
    type: 'number',
  })
  public CIRCADIAN_MAX_TEMP?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    default: DEFAULT_CIRCADIAN_MIN_TEMP,
    type: 'number',
  })
  public CIRCADIAN_MIN_TEMP?: number;

  // #endregion Object Properties
}

export const CIRCADIAN_MIN_TEMP = `libs.${LIB_CUSTOM.description}.CIRCADIAN_MIN_TEMP`;
export const CIRCADIAN_MAX_TEMP = `libs.${LIB_CUSTOM.description}.CIRCADIAN_MAX_TEMP`;
