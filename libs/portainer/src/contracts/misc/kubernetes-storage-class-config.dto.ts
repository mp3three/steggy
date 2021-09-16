export class KubernetesStorageClassConfigDTO {
  public AccessModes: string[];
  public AllowVolumeExpansion: boolean;
  public Name: string;
  public Provisioner: string;
}
