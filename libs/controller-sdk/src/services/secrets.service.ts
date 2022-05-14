import { Injectable } from '@nestjs/common';
import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';
import { existsSync, readFileSync } from 'fs';
import { parse } from 'ini';

import { SECRETS_FILE } from '../config';

@Injectable()
export class SecretsService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(SECRETS_FILE) private readonly secretsFile: string,
  ) {}

  private SECRETS: Record<string, string> = {};

  public buildMetadata(): Record<string, Record<string, unknown>> {
    return { secrets: this.SECRETS };
  }

  public tokenReplace(text: string): string {
    Object.keys(this.SECRETS).forEach(token => {
      text = text.replaceAll(`{{${token}}}`, this.SECRETS[token]);
    });
    return text;
  }

  protected onModuleInit(): void {
    if (is.empty(this.secretsFile)) {
      this.logger.debug(`No secrets file listed`);
      return;
    }
    if (!existsSync(this.secretsFile)) {
      this.logger.error(`Could not load file {${this.secretsFile}}`);
      return;
    }
    this.SECRETS = parse(readFileSync(this.secretsFile, 'utf8'));
  }
}
