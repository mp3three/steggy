export class RegistryConfigurePayloadDTO {
  public authentication: boolean;
  public password: string;
  public tls: boolean;
  public tlscacertFile: number[];
  public tlscertFile: number[];
  public tlskeyFile: number[];
  public tlsskipVerify: boolean;
  public username: string;
}
