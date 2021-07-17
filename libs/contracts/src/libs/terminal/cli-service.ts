export interface CLIService {
  // #region Object Properties

  description: string[];
  name: string;

  // #endregion Object Properties

  // #region Public Methods

  exec(): Promise<void>;

  // #endregion Public Methods
}
