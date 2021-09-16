import { OAuthPayloadDTO } from '../auth';
import { LDAPSettingsDTO } from './ldap-settings.dto';

export class SettingsDTO {
  public AllowBindMountsForRegularUsers: boolean;
  public AllowContainerCapabilitiesForRegularUsers: boolean;
  public AllowDeviceMappingForRegularUsers: boolean;
  public AllowHostNamespaceForRegularUsers: boolean;
  public AllowPrivilegedModeForRegularUsers: boolean;
  public AllowStackManagementForRegularUsers: boolean;
  public AllowVolumeBrowserForRegularUsers: boolean;
  public AuthenticationMethod: number;
  public BlacklistedLabels: Record<'name' | 'value', string>[];
  public EdgeAgentChecinInterval: number;
  public EnableEdgeComputeFeatures: boolean;
  public EnableElemetry: boolean;
  public EnableHostManagementFeatures: boolean;
  public LDAPSettings: LDAPSettingsDTO;
  public LogoURL: string;
  public OAuthSettings: OAuthPayloadDTO;
  public SnapshotInterval: string;
  public TemplatesURL: string;
  public UserSessionTimeout: string;
  public displayDonationHeader: boolean;
  public displayExternalContributors: boolean;
}
