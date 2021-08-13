export interface iWorkspaceMethods {
  // #region Public Methods

  onHide(): void;
  onShow(): void;

  // #endregion Public Methods
}
export type iWorkspace = Partial<iWorkspaceMethods>;
