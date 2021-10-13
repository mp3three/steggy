import { RoomEntitySaveStateDTO } from '@automagical/controller-logic';
import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
} from '@automagical/home-assistant';
import {
  FontAwesomeExtendedIcons,
  iRepl,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { IsEmpty } from '@automagical/utilities';

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
    let entities = await this.list();
    entities = entities
      .filter((entity) => IsEmpty(inList) || inList.includes(domain(entity)))
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

  public async createSaveState(
    entity_id: string,
  ): Promise<RoomEntitySaveStateDTO> {
    switch (domain(entity_id)) {
      case HASS_DOMAINS.light:
        return await this.lightService.createSaveState(entity_id);
      case HASS_DOMAINS.switch:
        return await this.switchService.createSaveState(entity_id);
      case HASS_DOMAINS.fan:
        return await this.fanService.createSaveState(entity_id);
      case HASS_DOMAINS.media_player:
        return await this.mediaService.createSaveState(entity_id);
      case HASS_DOMAINS.lock:
        return await this.lockService.createSaveState(entity_id);
      case HASS_DOMAINS.climate:
        return await this.climateService.createSaveState(entity_id);
    }
    return await this.baseService.createSaveState(entity_id);
  }

  public async exec(): Promise<void> {
    const entities = await this.list();
    return await this.processId(entities);
  }

  public async get(id: string): Promise<HassStateDTO> {
    return await this.fetchService.fetch({
      url: `/entity/id/${id}`,
    });
  }

  public async list(): Promise<string[]> {
    return await this.fetchService.fetch<string[]>({
      url: '/entity/list',
    });
  }

  public async pickOne(
    inList: HASS_DOMAINS[] = [],
    omit: string[] = [],
  ): Promise<string> {
    const entities = await this.list();
    return await this.promptService.autocomplete(
      `Pick an entity`,
      entities.filter((entity) => {
        if (!IsEmpty(inList) && !inList.includes(domain(entity))) {
          return false;
        }
        if (omit.includes(entity)) {
          return false;
        }
        return true;
      }),
    );
  }

  public async process(id: string): Promise<void> {
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
    await this.process(entity);
  }
}
