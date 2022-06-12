export class PackageJsonDTO {
  public bin?: Record<string, string>;
  public description?: string;
  public displayName?: string;
  public name?: string;
  public version?: string;
}
export const PACKAGE_FILE = `package.json`;
