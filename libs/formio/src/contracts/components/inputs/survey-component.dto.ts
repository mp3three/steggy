import { ComponentTypes } from '../enums';
import { LABEL_VALUE } from '../include';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class SurveyComponent extends BaseInputComponentDTO {
  // #region Object Properties

  public questions: LABEL_VALUE[];
  declare public type: ComponentTypes.survey;
  public values: LABEL_VALUE[];

  // #endregion Object Properties
}
