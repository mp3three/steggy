import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
} from '@automagical/home-assistant';
import { iRepl, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService, TitleCase } from '@automagical/utilities';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { HomeFetchService } from './home-fetch.service';

@Repl({
  description: [`Commands scoped to a single/manually built list of entities`],
  name: '🔍 Entities',
  type: REPL_TYPE.home,
})
export class EntityService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(): Promise<void> {
    const entities = await this.fetchService.fetch<string[]>({
      url: '/entity/list',
    });
    const domains = new Map<HASS_DOMAINS, string[]>();
    entities.forEach((entity) => {
      const entityDomain = domain(entity);
      const current = domains.get(entityDomain) ?? [];
      current.push(entity);
      domains.set(entityDomain, current);
    });
    const action = await this.promptService.pickOne(`Action`, [
      {
        name: 'Filter by domain',
        value: 'domain',
      },
      new inquirer.Separator(),
      {
        name: 'Done',
        value: 'done',
      },
    ]);

    switch (action) {
      case 'done':
        return;
      case 'domain':
        return await this.processDomain(domains);
    }
  }

  private async pickOne(entity: string): Promise<void> {
    const action = await this.promptService.pickOne(``, [
      {
        name: 'View state',
        value: 'state',
      },
      {
        name: 'Change friendly name',
        value: 'friendlyName',
      },
      new inquirer.Separator(),
      {
        name: 'Cancel',
        value: 'cancel',
      },
    ]);

    const state = await this.fetchService.fetch<HassStateDTO>({
      url: `/entity/id/${entity}`,
    });
    switch (action) {
      case 'cancel':
        return await this.exec();
      case 'state':
        console.log(encode(state));
        return await this.pickOne(entity);
      case 'friendlyName':
        const name = await this.promptService.string(
          `New name`,
          state.attributes.friendly_name,
        );
        await this.fetchService.fetch({
          body: { name },
          method: 'put',
          url: `/entity/rename/${entity}`,
        });
        return await this.pickOne(entity);
    }
  }

  private async processDomain(
    domains: Map<HASS_DOMAINS, string[]>,
  ): Promise<void> {
    const list: { name: string; value: HASS_DOMAINS }[] = [];
    domains.forEach((entities, domain) => {
      list.push({
        name: TitleCase(domain),
        value: domain,
      });
    });
    const entities = await this.promptService.pickOne(``, list);
    return await this.processEntities(domains.get(entities));
  }

  private async processEntities(entities: string[]): Promise<void> {
    const action = await this.promptService.pickOne(``, [
      {
        name: 'Pick One',
        value: 'pickOne',
      },
      new inquirer.Separator(),
      {
        name: 'Cancel',
        value: 'cancel',
      },
    ]);
    switch (action) {
      case 'cancel':
        return await this.exec();
      case 'pickOne':
        const entity = await this.promptService.pickOne(``, entities);
        return await this.pickOne(entity);
    }
  }
}
