import { ApiProperty } from '@nestjs/swagger';

export class HassUnitSystem {
  @ApiProperty()
  public length: 'mi';
  @ApiProperty()
  public mass: 'lb';
  @ApiProperty()
  public pressure: 'psi';
  @ApiProperty()
  public temperature: '°F';
  @ApiProperty()
  public volume: 'gal';
}

export class HassConfig {
  @ApiProperty()
  public allowlist_external_dirs: string[];
  @ApiProperty()
  public allowlist_external_urls: string[];
  @ApiProperty()
  public components: string[];
  @ApiProperty()
  public config_dir: string;
  @ApiProperty()
  public config_source: string;
  @ApiProperty()
  public currency: string;
  @ApiProperty()
  public elevation: number;
  @ApiProperty()
  public external_url: string;
  @ApiProperty()
  public internal_url: string;
  @ApiProperty()
  public latitude: number;
  @ApiProperty()
  public location_name: string;
  @ApiProperty()
  public longitude: number;
  @ApiProperty()
  public safe_mode: string;
  @ApiProperty()
  public state: string;
  @ApiProperty()
  public time_zone: string;
  @ApiProperty({ type: HassUnitSystem })
  public unit_system: HassUnitSystem;
  @ApiProperty()
  public version: string;
  @ApiProperty()
  public whitelist_external_dirs: string[];
}
