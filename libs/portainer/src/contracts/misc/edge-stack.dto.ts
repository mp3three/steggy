import { EdgeStackStatusDTO } from './edge-stack-status.dto';

export class EdgeStackDTO {
  public CreationDate: number;
  public EdgeGroups: number[];
  public Entrypoint: string;
  public Id: number;
  public Name: string;
  public ProjectPath: string;
  public Prune: boolean;
  public Status: EdgeStackStatusDTO;
  public Version: number;
}
