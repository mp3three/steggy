export interface iWorkspaceMethods {
  onHide(): void;
  onShow(): void;
}
export interface iWorkspace extends Partial<iWorkspaceMethods> {
  customHeader?: boolean;
}
