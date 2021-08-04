export interface Workspace {
  // #region Object Properties

  defaultActive?: boolean;
  menuPosition: string[];

  // #endregion Object Properties

  // #region Public Methods

  toggleVisibility(): void;

  // #endregion Public Methods
}
