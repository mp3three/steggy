export class DockerSnapshotDTO {
  public DockerSnapshotRaw: DockerSnapshotDTO;
  public DockerVersion: string;
  public HealthyContainerCount: number;
  public ImageCount: number;
  public NodeConut: number;
  public RunningContainerCount: number;
  public ServiceCount: number;
  public StackCount: number;
  public StoppedContainerCount: number;
  public Swarm: boolean;
  public Time: number;
  public TotalCPU: number;
  public TotalMemory: number;
  public UnhealthyContainerCount: number;
  public VoumeCount: number;
}
