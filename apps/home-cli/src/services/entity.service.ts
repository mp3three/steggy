import {
  FanCacheDTO,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-logic';
import {
  domain,
  HASS_DOMAINS,
  HassStateDTO,
} from '@automagical/home-assistant';
import {
  ICONS,
  iRepl,
  PinnedItemService,
  PromptService,
  Repl,
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
  category: `Home Assistant`,
  description: [`Commands scoped to a single/manually built list of entities`],
  icon: ICONS.ENTITIES,
  name: `Entities`,
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
    private readonly pinnedItems: PinnedItemService,
    private readonly climateService: ClimateService,
  ) {}

  public async buildList(
    inList: HASS_DOMAINS[] = [],
    { omit = [] }: { omit?: string[] } = {},
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

  public async createSaveCommand(
    entity_id: string,
    current?: RoomEntitySaveStateDTO,
  ): Promise<RoomEntitySaveStateDTO> {
    switch (domain(entity_id)) {
      case HASS_DOMAINS.light:
        return await this.lightService.createSaveCommand(
          entity_id,
          current as RoomEntitySaveStateDTO<LightingCacheDTO>,
        );
      case HASS_DOMAINS.switch:
        return await this.switchService.createSaveCommand(entity_id, current);
      case HASS_DOMAINS.fan:
        return await this.fanService.createSaveCommand(
          entity_id,
          current as RoomEntitySaveStateDTO<FanCacheDTO>,
        );
      case HASS_DOMAINS.media_player:
        return await this.mediaService.createSaveCommand(entity_id, current);
      case HASS_DOMAINS.lock:
        return await this.lockService.createSaveCommand(entity_id, current);
      case HASS_DOMAINS.climate:
        return await this.climateService.createSaveCommand(entity_id, current);
    }
    return await this.baseService.createSaveCommand(entity_id, current);
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

  public async pickInDomain(
    inList: HASS_DOMAINS[] = [],
    omit: string[] = [],
    defaultValue?: string,
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
      defaultValue,
    );
  }

  public async pickMany(
    inList: string[] = [],
    defaultValue?: string[],
  ): Promise<string[]> {
    const entities = await this.list();
    return await this.promptService.pickMany(
      `Pick an entity`,
      entities
        .filter((entity) => IsEmpty(inList) || inList.includes(entity))
        .map((id) => [id, id]),
      { default: defaultValue },
    );
  }

  public async pickOne(
    inList: string[] = [],
    defaultValue?: string,
  ): Promise<string> {
    const entities = await this.list();
    return await this.promptService.autocomplete(
      `Pick an entity`,
      entities.filter((entity) => IsEmpty(inList) || inList.includes(entity)),
      defaultValue,
    );
  }

  public async process(id: string): Promise<void> {
    this.promptService.clear();
    this.promptService.scriptHeader(`Entity`);
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

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set(
      'entity',
      async ({ entity_id }: { entity_id: string }) =>
        await this.process(entity_id),
    );
  }
}
