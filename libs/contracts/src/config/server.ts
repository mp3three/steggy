import { APP_HOME_CONTROLLER, LIB_SERVER } from '../constants';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_SERVER.description);
export class ServerConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    type: 'boolean',
  })
  public COMPRESSION?: boolean;
  @UsesConfig({
    applications: {},
    type: 'password',
  })
  public ADMIN_KEY?: string;

  // #endregion Object Properties
}

export const ADMIN_KEY = `libs.${LIB_SERVER.description}.ADMIN_KEY`;
export const COMPRESSION = `libs.${LIB_SERVER.description}.COMPRESSION`;
