import {
  EditItemPayloadDTO,
  GetItemPayloadDTO,
  ListItemItemDTO,
  ListItemPayloadDTO,
  VaultDTO,
} from '@automagical/contracts/1password';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import execa from 'execa';

type GenericOptions = Record<string, boolean | string | string[]>;

@Injectable()
export class ItemService {
  // #region Public Methods

  @Trace()
  public async edit({
    item,
    'generate-password': generate,
    assignments,
    ...options
  }: EditItemPayloadDTO): Promise<void> {
    const parameters = ['edit', 'item', item];
    if (generate) {
      const parts: string[] = [];
      if (generate.digits) {
        parameters.push('digits');
      }
      if (generate.symbols) {
        parameters.push('symbols');
      }
      if (generate.letters) {
        parameters.push('letters');
      }
      if (generate.length > 0) {
        parameters.push(generate.length.toString());
      }
      parameters.push(`--generate-password=${parts.join(',')}`);
    }
    assignments ??= [];
    assignments.forEach((assignment) => {
      const key = assignment.section
        ? `${assignment.section}.${assignment.field}`
        : assignment.field;
      parameters.push(`${key}=${assignment.value}`);
    });
    Object.keys(options ?? {}).forEach((key) =>
      parameters.push(`--${key}`, options[key]),
    );
    const { stdout } = await execa('op', parameters);
    return JSON.parse(stdout);
  }

  @Trace()
  public async get({ item, ...options }: GetItemPayloadDTO): Promise<VaultDTO> {
    const parameters = ['get', 'item', item];
    Object.keys(options ?? {}).forEach((key) =>
      parameters.push(
        `--${key}`,
        Array.isArray(options[key]) ? options[key].join(',') : options[key],
      ),
    );
    const { stdout } = await execa('op', parameters);
    return JSON.parse(stdout);
  }

  @Trace()
  public async list(options?: ListItemPayloadDTO): Promise<ListItemItemDTO[]> {
    const parameters = this.mergeOptions(
      ['list', 'vault'],
      options as GenericOptions,
    );
    const { stdout } = await execa('op', parameters);
    return JSON.parse(stdout);
  }

  // #endregion Public Methods

  // #region Private Methods

  private mergeOptions(
    parameters: string[],
    options: GenericOptions,
  ): string[] {
    Object.keys(options ?? {}).forEach((key) => {
      parameters.push(`--${key}`);
      if (typeof options.key === 'boolean') {
        return;
      }
      let value = options[key] as string | string[];
      if (Array.isArray(value)) {
        value = value.join(',');
      }

      parameters.push(value);
    });
    return parameters;
  }

  // #endregion Private Methods
}
