import { ListVaultItem, VaultDTO } from '@automagical/1password';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import execa from 'execa';

@Injectable()
export class VaultService {
  @Trace()
  public async edit(vault: string, name: string): Promise<void> {
    const { stdout } = await execa('op', [
      'edit',
      'vault',
      vault,
      '--name',
      name,
    ]);
    return JSON.parse(stdout);
  }

  @Trace()
  public async get(vault: string): Promise<VaultDTO> {
    const { stdout } = await execa('op', ['get', 'vault', vault]);
    return JSON.parse(stdout);
  }

  @Trace()
  public async list(
    options?: Partial<Record<'group' | 'user', string>>,
  ): Promise<ListVaultItem[]> {
    const parameters: string[] = ['list', 'vault'];
    Object.keys(options ?? {}).forEach((key) =>
      parameters.push(`--${key}`, options[key]),
    );
    const { stdout } = await execa('op', parameters);
    return JSON.parse(stdout);
  }
}
