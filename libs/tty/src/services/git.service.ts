import { EMPTY } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import execa from 'execa';
import { decode } from 'ini';

import { GitConfigDTO } from '../contracts';

@Injectable()
export class GitService {
  public async getBranchName(): Promise<string> {
    const { stdout } = await execa(`git`, [
      `rev-parse`,
      `--abbrev-ref`,
      `HEAD`,
    ]);
    return stdout;
  }

  public async getConfig(): Promise<GitConfigDTO> {
    const { stdout } = await execa(`git`, [`config`, `--list`]);
    return decode(stdout) as GitConfigDTO;
  }

  /**
   * Is there any uncommitted changes?
   */

  public async isDirty(): Promise<boolean> {
    const { stdout } = await execa(`git`, [`status`, `--porcelain`]);
    return stdout.length > EMPTY;
  }

  /**
   * Grab all the commit messages between here and `origin/develop`
   *
   * This should also
   */

  public async listCommitMessages(
    base = `origin/develop`,
    reference?: string,
  ): Promise<string[]> {
    reference ??= await this.getBranchName();
    const { stdout } = await execa(`git`, [
      `rev-list`,
      `--oneline`,
      reference,
      `^${base}`,
    ]);
    const messages = stdout.split(`\n`).map((line) => {
      const [, ...message] = line.split(' ');
      return message.join(' ');
    });
    return messages;
  }
}
