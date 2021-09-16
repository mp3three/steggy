export class UserDTO {
  public EndpointAuthorizations: Record<string, Record<string, boolean>>;
  public Id: number;
  public Password: string;
  public PortainerAuthorizatinos: Record<string, boolean>;
  public Role: number;
  public Username: string;
}
