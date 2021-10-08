import { domain, HASS_DOMAINS } from '@automagical/home-assistant';
import {
  FontAwesomeExtendedIcons,
  iRepl,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';

import {
  BaseDomainService,
  ClimateService,
  FanService,
  LightService,
  LockService,
  MediaService,
  SwitchService,
} from './domains';
import { HomeFetchService } from './home-fetch.service';

const EMPTY = 0;

@Repl({
  description: [`Commands scoped to a single/manually built list of entities`],
  icon: FontAwesomeExtendedIcons.checklist_o,
  name: `Entities`,
  type: REPL_TYPE.home,
})
export class EntityService implements iRepl {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly baseService: BaseDomainService,
    private readonly lightService: LightService,
    private readonly switchService: SwitchService,
    private readonly fanService: FanService,
    private readonly mediaService: MediaService,
    private readonly lockService: LockService,
    private readonly climateService: ClimateService,
  ) {}

  public async buildList(
    inList: HASS_DOMAINS[] = [],
    omit: string[] = [],
  ): Promise<string[]> {
    let entities = await this.fetchService.fetch<string[]>({
      url: '/entity/list',
    });
    entities = entities
      .filter(
        (entity) => inList.length === EMPTY || inList.includes(domain(entity)),
      )
      .filter((item) => !omit.includes(item));
    const out: string[] = [];
    let exec = true;
    // eslint-disable-next-line no-loops/no-loops
    do {
      out.push(
        await this.promptService.autocomplete(
          `Pick one`,
          entities.filter((item) => !out.includes(item)),
        ),
      );
      exec = await this.promptService.confirm(`Add another?`, true);
    } while (exec === true);
    return out;
  }

  public async exec(): Promise<void> {
    const entities = await this.fetchService.fetch<string[]>({
      url: '/entity/list',
    });
    return await this.processId(entities);
  }

  public async pickOne(id: string): Promise<void> {
    switch (domain(id)) {
      case HASS_DOMAINS.light:
        await this.lightService.processId(id);
        return;
      case HASS_DOMAINS.switch:
        await this.switchService.processId(id);
        return;
      case HASS_DOMAINS.fan:
        await this.fanService.processId(id);
        return;
      case HASS_DOMAINS.media_player:
        await this.mediaService.processId(id);
        return;
      case HASS_DOMAINS.lock:
        await this.lockService.processId(id);
        return;
      case HASS_DOMAINS.climate:
        await this.climateService.processId(id);
        return;
    }
    await this.baseService.processId(id);
  }

  public async processId(ids: string[]): Promise<void> {
    const entity = await this.promptService.autocomplete('Pick an entity', ids);
    await this.pickOne(entity);
  }
}
