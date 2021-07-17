import { ACTION_NAMES, ActionDTO } from '../formio-sdk';

export class SubmissionActionInfoDTO {
  // #region Object Properties

  public access?: Record<'handler' | 'method', boolean>;
  public default?: boolean;
  public defaults?: Record<string, unknown>;
  public description: string;
  public group?: string;
  public name: ACTION_NAMES;
  public priority: number;
  public title: string;

  // #endregion Object Properties
}

export interface SubmissionAction {
  // #region Object Properties

  info: SubmissionActionInfoDTO;
  settingsForm: unknown;

  // #endregion Object Properties

  // #region Public Methods

  exec(action: ActionDTO): Promise<{ type: unknown[] }>;

  // #endregion Public Methods
}
