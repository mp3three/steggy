export interface iDriver {
  // #region Public Methods

  create<T extends Record<never, unknown>>(project: T): Promise<T>;

  // #endregion Public Methods
}
