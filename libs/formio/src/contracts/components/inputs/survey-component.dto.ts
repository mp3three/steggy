import { ComponentTypes } from '../enums';
import { LABEL_VALUE } from '../include';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class SurveyComponent extends BaseInputComponentDTO {
  public questions: LABEL_VALUE[];
  public declare type: ComponentTypes.survey;
  public values: LABEL_VALUE[];

  
}
