import { AccessDTO, ActionDTO, FormDTO, RoleDTO } from '../formio-sdk';

export class ProjectExportDetailsDTO {
  // #region Object Properties

  public access: AccessDTO[];
  public actions: Record<string, ActionDTO>;
  public forms: Record<string, FormDTO>;
  public name: string;
  public resources: Record<string, FormDTO>;
  public roles: Record<string, RoleDTO>;
  public title: string;
  public version: string;

  // #endregion Object Properties
}
