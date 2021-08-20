import { KubernetesSnapshotDTO } from './kubernetes-snapshot.dto';
import { KubernetesStorageClassConfigDTO } from './kubernetes-storage-class-config.dto';

export class KubernetesDataDTO {
  // #region Object Properties

  public Configuration: KubernetesStorageClassConfigDTO;
  public Snapshots: KubernetesSnapshotDTO[];

  // #endregion Object Properties
}
