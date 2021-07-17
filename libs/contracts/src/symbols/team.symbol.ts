import { CrudOptions } from '../interfaces/crud-options';
import { ResultControlDTO } from '../libs/fetch';
import { ProjectDTO, TeamDTO, TeamMemberDTO } from '../libs/formio-sdk';

export interface TeamAdapter {
  // #region Public Methods

  getTeamProjects(
    team: TeamDTO | string,
    options: CrudOptions,
  ): Promise<ProjectDTO[]>;
  getUserTeams(
    control: ResultControlDTO,
    options: CrudOptions,
  ): Promise<TeamMemberDTO[]>;

  // #endregion Public Methods
}
export const TeamAdapter = Symbol('TeamAdapter');
export type iTeamAdapter = TeamAdapter;
