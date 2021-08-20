import { Status, TemplateTypes } from '../enums';
import { GitRepoConfigDTO } from './repo-config.dto';
import { ResourceControlDTO } from './resource-control.dto';

export class StackDTO {
  // #region Object Properties

  public EndpointId: number;
  public EntryPoint: string;
  public Env: Record<'name' | 'value', string>[];
  public Id: number;
  public Name: string;
  public ResourceControl: ResourceControlDTO;
  public Status: Status;
  public SwarmId: string;
  public Type: TemplateTypes;
  public createdBy: StaticRange;
  public creationDate: number;
  public gitConfig: GitRepoConfigDTO;
  public projectPath: string;
  public updateDate: number;
  public updatedBy: string;

  // #endregion Object Properties
}
