import { CreateConfigurableAnnotation } from '../../decorators';

const UsesConfig = CreateConfigurableAnnotation();
export class DevtoolsApplicationSettingsDTO {
  // #region Object Properties

  @UsesConfig({
    applications: 'available',

    title: 'AWS Environment',
    type: {
      key: {
        title: 'Environment Name',
        type: 'string',
      },
      value: {
        title: 'Version label',
        type: 'string',
      },
    },
  })
  public AWS_ENVIRONMENTS: Record<string, string>;

  // #endregion Object Properties
}
export const AWS_ENVIRONMENTS = 'application.AWS_ENVIRONMENTS';
