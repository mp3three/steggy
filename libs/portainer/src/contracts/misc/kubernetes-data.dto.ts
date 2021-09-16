import { KubernetesSnapshotDTO } from './kubernetes-snapshot.dto';
import { KubernetesStorageClassConfigDTO } from './kubernetes-storage-class-config.dto';

export class KubernetesDataDTO {
  public Configuration: KubernetesStorageClassConfigDTO;
  public Snapshots: KubernetesSnapshotDTO[];
}
