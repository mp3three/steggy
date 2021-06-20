import { IsEnum, IsString } from 'class-validator';

export enum RoleActionTypes {
  add = 'add',
  remove = 'remove',
}

export enum RoleActionAssociation {
  existing = 'existing',
  new = 'new',
}

export class RoleActionSettingsDTO {
  // #region Object Properties

  /**
   * New resource, or existing
   *
   * FIXME: Expand on this. What is an association?
   */
  @IsEnum(RoleActionAssociation)
  public association: RoleActionAssociation;
  /**
   * Add or remove
   */
  @IsEnum(RoleActionTypes)
  public type: RoleActionTypes;
  /**
   * ID Reference to role
   */
  @IsString() public la;

  public role: string;

  // #endregion Object Properties
}
// {
//   _id: "60456c9afb0a1bc7fab1c349",
//   handler: ["after"],
//   method: ["create"],
//   priority: 1,
//   name: "role",
//   title: "Role Assignment",
//   settings: {
//     association: "existing",
//     type: "add",
//     role: "6045267faf1db69921de9324",
//   },
//   condition: { eq: "", value: "", custom: "" },
//   form: "60455a95fb0a1bb5e9b1c329",
//   machineName: "formio:name:role",
// }
