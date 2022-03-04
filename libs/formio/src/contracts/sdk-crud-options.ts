import { CrudOptions } from '@automagical/server';

import { FormDTO } from './form.dto';
import { ProjectDTO } from './project.dto';

export class SDKCrudOptions extends CrudOptions {
  form?: FormDTO;
  project?: ProjectDTO;
}
