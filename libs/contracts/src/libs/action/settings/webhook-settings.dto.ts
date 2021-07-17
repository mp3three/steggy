import { HTTP_METHODS } from '../../fetch';

export class WebhookActionSettingsDTO {
  // #region Object Properties

  public block: boolean;
  public externalIdPath: string;
  public externalIdType: string;
  public forwardHeaders: string;
  public headers: Record<string, string>;
  public method: HTTP_METHODS;
  public password: string;
  public transform: string;
  public url: string;
  public username: string;

  // #endregion Object Properties
}
