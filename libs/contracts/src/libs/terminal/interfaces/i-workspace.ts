export interface iWorkspaceMethods {
  // #region Public Methods

  onHide(): void;
  onShow(): void;

  // #endregion Public Methods
}
export interface iWorkspace extends Partial<iWorkspaceMethods> {
  // #region Object Properties

  customHeader?: boolean;

  // #endregion Object Properties
}
