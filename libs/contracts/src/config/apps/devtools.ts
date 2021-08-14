import { CreateConfigurableAnnotation } from '../../decorators';
import { APP_DEVTOOLS } from '../../library-names';

const UsesConfig = CreateConfigurableAnnotation();
export class DevtoolsApplicationSettingsDTO {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_DEVTOOLS.description]: 'available',
    },
    type: 'string',
  })
  public YOINK_DEFAULT_PATH: string;

  // #endregion Object Properties
}
export const YOINK_DEFAULT_PATH = 'application.YOINK_DEFAULT_PATH';
