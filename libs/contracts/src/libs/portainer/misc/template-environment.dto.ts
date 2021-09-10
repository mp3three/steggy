import { TemplateEnvironmentSelectDTO } from './template-environment-select.dto';

export class TemplateEnvironmentDTO {
  public decription: string;
  public default: string;
  public label: string;
  public name: string;
  public preset: boolean;
  public select: TemplateEnvironmentSelectDTO[];
}
