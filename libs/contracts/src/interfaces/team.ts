import { ResultControlDTO } from '@automagical/contracts/fetch';
import {
  ProjectDTO,
  TeamDTO,
  TeamMemberDTO,
} from '@automagical/contracts/formio-sdk';

export interface TeamAdapter {
  // #region Public Methods

  getTeamProjects(team: TeamDTO | string): Promise<ProjectDTO[]>;
  getUserTeams(control: ResultControlDTO): Promise<TeamMemberDTO[]>;

  // #endregion Public Methods
}
export const TeamAdapter = Symbol('TeamAdapter');
