import { ResourceControlTypes } from '../enums';

export class ResourceControlDTO {
  public AccessLevel: number;
  public AdministratorsOnly: boolean;
  public Id: number;
  public OwnerId: number;
  public Public: boolean;
  public ResourceId: string;
  public System: boolean;
  public Type: ResourceControlTypes;
}
