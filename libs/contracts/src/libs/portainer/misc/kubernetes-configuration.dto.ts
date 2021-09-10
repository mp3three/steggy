import { KubernetesIncressClassConfigDTO } from './kubernetes-ingress-class-config.dto';
import { KubernetesStorageClassConfigDTO } from './kubernetes-storage-class-config.dto';

export class KubernetesConfigurationDTO {
  public IncressClasses: KubernetesIncressClassConfigDTO[];
  public StorageClasses: KubernetesStorageClassConfigDTO[];
  public UseLoadBalancer: boolean;
  public UseServerMetrics: boolean;
}
