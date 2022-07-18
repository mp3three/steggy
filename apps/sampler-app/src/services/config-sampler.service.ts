import { Injectable } from '@nestjs/common';
import { ApplicationManagerService, PromptService } from '@steggy/tty';

@Injectable()
export class ConfigSampler {
  constructor(
    private readonly prompt: PromptService,
    private readonly application: ApplicationManagerService,
  ) {}

  public exec(): void {
    //
  }
}
