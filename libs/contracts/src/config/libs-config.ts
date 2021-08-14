import { APP_DASHBOARD, APP_HOME_CONTROLLER } from '..';
import { CreateConfigurableAnnotation } from '../decorators';
import {
  AuthenticationConfig,
  FormioSDKConfig,
  ServerConfig,
  UtilsConfig,
} from '.';
import { CustomLogicConfig } from './controller-logic';
import { HomeAssistantConfig } from './home-assistant';

const ConfigurableProperty = CreateConfigurableAnnotation();
export class ConfigLibs {
  // #region Object Properties

  @ConfigurableProperty({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    type: {
      reference: CustomLogicConfig,
    },
  })
  public custom?: CustomLogicConfig;
  @ConfigurableProperty({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    type: {
      reference: ServerConfig,
    },
  })
  public server?: ServerConfig;
  @ConfigurableProperty({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
      [APP_DASHBOARD.description]: 'available',
    },
    type: {
      reference: HomeAssistantConfig,
    },
  })
  public homeassistant?: HomeAssistantConfig;
  @ConfigurableProperty({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
      [APP_DASHBOARD.description]: 'available',
    },
    type: {
      reference: UtilsConfig,
    },
  })
  public utils?: UtilsConfig;
  @ConfigurableProperty({
    applications: {},
    type: {
      reference: AuthenticationConfig,
    },
  })
  public authentication?: AuthenticationConfig;
  @ConfigurableProperty({
    applications: {},
    type: {
      reference: FormioSDKConfig,
    },
  })
  public formiosdk?: FormioSDKConfig;

  // #endregion Object Properties
}
