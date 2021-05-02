export interface iDriver {
  // #region Public Methods

  create(project: unknown): Promise<unknown>;

  // #endregion Public Methods
}
