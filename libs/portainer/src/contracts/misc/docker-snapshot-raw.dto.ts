export class DockerSnapshotRawDTO {
  public Containers: Record<string, unknown>;
  public Images: Record<string, unknown>;
  public Info: Record<string, unknown>;
  public Networks: Record<string, unknown>;
  public Version: Record<string, unknown>;
  public Volumes: Record<string, unknown>;
}
