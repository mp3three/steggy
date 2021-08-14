import { LIB_UTILS } from '../..';
import { CreateConfigurableAnnotation } from '../../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_UTILS.description);
export class AWSUtilitiesConfig {
  // #region Object Properties

  @UsesConfig({
    applications: 'default',
    type: 'password',
  })
  public secretAccessKey: string;
  @UsesConfig({
    applications: 'default',
    type: 'string',
  })
  public accessKeyId: string;

  // #endregion Object Properties
}
