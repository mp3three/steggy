import { GroupPersistenceService } from '@automagical/controller-logic';
import {
  HomeAssistantCoreService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SwitchGroupService {
  constructor(
    private readonly hassCore: HomeAssistantCoreService,
    private readonly persistence: GroupPersistenceService,
  ) {}
}
