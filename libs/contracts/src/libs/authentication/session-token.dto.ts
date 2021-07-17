import {
  FormDTO,
  PERMISSION_ACCESS_TYPES,
  ProjectDTO,
  UserDTO,
} from '../formio-sdk';

export class SessionTokenDTO {
  // #region Object Properties

  public exp?: number;
  public form?: FormDTO;
  public iat?: number;
  public iss?: string;
  public jti?: string;
  public permission?: PERMISSION_ACCESS_TYPES;
  public project?: ProjectDTO;
  public sessionId?: string;
  public sub?: string;
  public user: UserDTO;

  // #endregion Object Properties
}
