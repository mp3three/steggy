import { APP_DASHBOARD, APP_HOME_CONTROLLER, LIB_CONTROLLER_LOGIC } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(
  LIB_CONTROLLER_LOGIC.description,
);
export const DEFAULT_CIRCADIAN_MIN_TEMP = 2000;
export const DEFAULT_CIRCADIAN_MAX_TEMP = 5500;
export const DEFAULT_DIM_PERCENT = 10;

export class CustomLogicConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: DEFAULT_CIRCADIAN_MAX_TEMP,
    type: 'number',
  })
  public CIRCADIAN_MAX_TEMP?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: DEFAULT_CIRCADIAN_MIN_TEMP,
    type: 'number',
  })
  public CIRCADIAN_MIN_TEMP?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    default: DEFAULT_DIM_PERCENT,
    type: 'number',
  })
  public DIM_PERCENT?: number;

  // #endregion Object Properties
}

/**
 * The reddest the lighting can go
 */
export const CIRCADIAN_MIN_TEMP = `libs.${LIB_CONTROLLER_LOGIC.description}.CIRCADIAN_MIN_TEMP`;

/**
 * The bluest the lighting can go
 */
export const CIRCADIAN_MAX_TEMP = `libs.${LIB_CONTROLLER_LOGIC.description}.CIRCADIAN_MAX_TEMP`;

/**
 * Single press dimmer button: how far to move the brightness
 */
export const DIM_PERCENT = `libs.${LIB_CONTROLLER_LOGIC.description}.DIM_PERCENT`;
