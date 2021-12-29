import { Injectable } from '@nestjs/common';

import { EnvironmentService } from './environment.service';

@Injectable()
export class TableService {
  constructor(private readonly environment: EnvironmentService) {}
  public render(): string {
    return ``;
  }
}
