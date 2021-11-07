export class HassConfig {
  public allowlist_external_dirs: string[];
  public allowlist_external_urls: string[];
  public components: string[];
  public config_dir: string;
  public config_source: string;
  public currency: string;
  public elevation: number;
  public external_url: string;
  public internal_url: string;
  public latitude: number;
  public location_name: string;
  public longitude: number;
  public safe_mode: string;
  public state: string;
  public time_zone: string;
  public unit_system: HassUnitSystem;
  public version: string;
  public whitelist_external_dirs: string[];
}
export class HassUnitSystem {
  public length: 'mi';
  public mass: 'lb';
  public pressure: 'psi';
  public temperature: '°F';
  public volume: 'gal';
}
