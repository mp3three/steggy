import { StackType } from '../enums';
import { TemplateEnvironmentDTO } from './template-environment.dto';
import { TemplateVolumeDTO } from './template-valume.dto';

export class TemplateDTO {
  // #region Object Properties

  public Id: number;
  public administrators_only: boolean;
  public categories: string[];
  public command: string;
  public description: string;
  public env: TemplateEnvironmentDTO;
  public hostname: string;
  public image: string;
  public interactive: boolean;
  public labels: Record<'name' | 'value', string>[];
  public logo: string;
  public name: string;
  public network: string;
  public note: string;
  public platform: string;
  public ports: string[];
  public privileged: boolean;
  public registry: string;
  public restart_policy: string;
  public stackFile: string;
  public title: string;
  public type: StackType;
  public volumes: TemplateVolumeDTO;

  // #endregion Object Properties
}
