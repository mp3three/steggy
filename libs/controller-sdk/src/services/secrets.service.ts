import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';

import { SECRETS } from '../config';

@Injectable()
export class SecretsService {
  constructor(
    @InjectConfig(SECRETS)
    private readonly secrets: Record<string, string> = {},
  ) {}

  public buildMetadata(): { secrets: Record<string, unknown> } {
    return { secrets: this.secrets };
  }

  public tokenReplace(text: string): string {
    Object.keys(this.secrets).forEach(token => {
      text = text.replaceAll(`{{${token}}}`, this.secrets[token]);
    });
    return text;
  }
}
