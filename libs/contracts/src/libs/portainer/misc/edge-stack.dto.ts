import { EdgeStackStatusDTO } from './edge-stack-status.dto';

export class EdgeStackDTO {
  // #region Object Properties

  public CreationDate: number;
  public EdgeGroups: number[];
  public Entrypoint: string;
  public Id: number;
  public Name: string;
  public ProjectPath: string;
  public Prune: boolean;
  public Status: EdgeStackStatusDTO;
  public Version: number;

  // #endregion Object Properties
}
