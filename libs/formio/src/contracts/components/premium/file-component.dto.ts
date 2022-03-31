import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { LABEL_VALUE } from '../include';

export class FileComponentDTO extends BaseComponentDTO {
  public fileTypes: LABEL_VALUE[];
  public declare input: true;
  public declare type: ComponentTypes.file;
  public webcam: boolean;
}
