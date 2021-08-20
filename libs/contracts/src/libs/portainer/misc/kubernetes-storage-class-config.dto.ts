export class KubernetesStorageClassConfigDTO {
  // #region Object Properties

  public AccessModes: string[];
  public AllowVolumeExpansion: boolean;
  public Name: string;
  public Provisioner: string;

  // #endregion Object Properties
}
