import { CreateConfigurableAnnotation } from '../../decorators';

const UsesConfig = CreateConfigurableAnnotation();
export class DashboardApplicationSettingsDTO {
  // #region Object Properties

  @UsesConfig({
    applications: 'available',
    default: 'Dashboard',
    type: 'string',
  })
  public SCREEN_TITLE: string;

  // #endregion Object Properties
}
export const SCREEN_TITLE = 'application.SCREEN_TITLE';
