import {
  HomeAssistantCoreService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaGroupService {
  constructor(
    private readonly switchService: SwitchDomainService,
    private readonly hassCore: HomeAssistantCoreService,
  ) {}
}
