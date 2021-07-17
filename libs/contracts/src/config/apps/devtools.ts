import { CreateAnnotation } from '../../decorators';
import { CONFIG_PROVIDERS } from '../../libs/terminal/config-provider';

const UsesConfig = CreateAnnotation();
export class DevtoolsApplicationSettingsDTO {
  // #region Object Properties

  @UsesConfig({
    applications: 'available',
    record: {
      key: 'Environment Name',
      value: 'Version Label',
    },
    recordProvider: {
      key: CONFIG_PROVIDERS.ebenvironment,
      value: CONFIG_PROVIDERS.application,
    },
    type: 'record',
    what: 'AWS Environment',
  })
  public AWS_ENVIRONMENTS: Record<string, string>;

  // #endregion Object Properties
}
export const AWS_ENVIRONMENTS = 'application.AWS_ENVIRONMENTS';
