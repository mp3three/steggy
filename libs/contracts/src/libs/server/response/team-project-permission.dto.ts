import { TeamDTO } from '@automagical/contracts/formio-sdk';

export type TeamProjectPermissionDTO = TeamDTO & {
  permission: string;
};
