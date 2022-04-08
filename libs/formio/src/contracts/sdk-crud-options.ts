import { CrudOptions } from '@steggy/server';

import { FormDTO } from './form.dto';
import { ProjectDTO } from './project.dto';

export class SDKCrudOptions extends CrudOptions {
  form?: FormDTO;
  project?: ProjectDTO;
}
