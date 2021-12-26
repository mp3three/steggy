import {
  FanCacheDTO,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-logic';
import { domain, HASS_DOMAINS, HassStateDTO } from '@text-based/home-assistant';
import {
  ICONS,
  iRepl,
  IsDone,
  MenuEntry,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@text-based/tty';
import { is, IsEmpty, VALUE } from '@text-based/utilities';

import { MENU_ITEMS } from '../../includes';
import {
  BaseDomainService,
  ClimateService,
  FanService,
  LightService,
  LockService,
  MediaService,
  SwitchService,
} from '../domains';
import { HomeFetchService } from '../home-fetch.service';

@Repl({
  category: `Home Assistant`,
  description: [`Commands scoped to a single/manually built list of entities`],
  icon: ICONS.ENTITIES,
  keybind: 'e',
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
    { omit = [], current = [] }: { current?: string[]; omit?: string[] } = {},
  ): Promise<string[]> {
    let entities = await this.list();
    entities = entities
      .filter((entity) => IsEmpty(inList) || inList.includes(domain(entity)))
      .filter((item) => !omit.includes(item));
    const source = entities.filter((i) => !current.includes(i));
    return await this.promptService.listBuild({
      current: current.map((i) => [i, i]),
      items: 'Entities',
      source: source.map((i) => [i, i]),
    });
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
    const entity = await this.pickOne();
    if (!is.string(entity)) {
      return;
    }
    return await this.process(entity);
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
    const list = entities
      .filter((entity) => {
        if (!IsEmpty(inList) && !inList.includes(domain(entity))) {
          return false;
        }
        if (omit.includes(entity)) {
          return false;
        }
        return true;
      })
      .map((i) => [i, i] as PromptEntry);
    return await this.promptService.menu({
      keyMap: {},
      right: ToMenuEntry(list),
      value: defaultValue,
    });
  }

  public async pickMany(
    inList: string[] = [],
    current: string[] = [],
  ): Promise<string[]> {
    const entities = (await this.list())
      .filter((i) => (IsEmpty(inList) ? true : inList.includes(i)))
      .map((i) => [i, i] as MenuEntry);
    return await this.promptService.listBuild({
      current: entities.filter((i) => current.includes(i[VALUE])),
      items: 'Entities',
      source: entities.filter((i) => !current.includes(i[VALUE])),
    });
  }

  public async pickOne(inList: string[] = [], value?: string): Promise<string> {
    const entities = await this.list();
    return await this.promptService.menu({
      keyMap: {},
      right: ToMenuEntry(
        (IsEmpty(inList)
          ? entities
          : entities.filter((i) => inList.includes(i))
        ).map((i) => [i, i] as PromptEntry),
      ),
      value,
    });
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
    const entity = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(ids.map((i) => [i, i])),
    });
    if (IsDone(entity)) {
      return;
    }
    await this.process(entity);
  }

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set(
      'entity',
      async ({ id }) => await this.process(id),
    );
  }
}
