import { TeamDTO } from '../formio-sdk';

export type TeamProjectPermissionDTO = TeamDTO & {
  permission: string;
};
