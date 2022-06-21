import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import {
  domain,
  FanAttributesDTO,
  HassStateDTO,
  LightAttributesDTO,
} from '@steggy/home-assistant-shared';
import {
  IsDone,
  MenuEntry,
  PromptEntry,
  PromptService,
  ToMenuEntry,
} from '@steggy/tty';
import { is, VALUE } from '@steggy/utilities';

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
import { PinnedItemService } from '../pinned-item.service';

// @Repl({
//   category: `Home Assistant`,
//   description: [`Commands scoped to a single/manually built list of entities`],
//   icon: ICONS.ENTITIES,
//   keybind: 'e',
//   name: `Entities`,
// })
@Injectable()
export class EntityService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => BaseDomainService))
    private readonly baseService: BaseDomainService,
    @Inject(forwardRef(() => LightService))
    private readonly lightService: LightService,
    @Inject(forwardRef(() => SwitchService))
    private readonly switchService: SwitchService,
    @Inject(forwardRef(() => FanService))
    private readonly fanService: FanService,
    @Inject(forwardRef(() => MediaService))
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => LockService))
    private readonly lockService: LockService,
    private readonly pinnedItems: PinnedItemService,
    @Inject(forwardRef(() => ClimateService))
    private readonly climateService: ClimateService,
  ) {}

  public async buildList(
    inList: string[] = [],
    { omit = [], current = [] }: { current?: string[]; omit?: string[] } = {},
  ): Promise<string[]> {
    let entities = await this.list();
    entities = entities
      .filter(entity => is.empty(inList) || inList.includes(domain(entity)))
      .filter(item => !omit.includes(item));
    const source = entities.filter(i => !current.includes(i));
    return await this.promptService.listBuild({
      current: current.map(i => [i, i]),
      items: 'Entities',
      source: source.map(i => [i, i]),
    });
  }

  public async createSaveCommand(
    entity_id: string,
    current?: GeneralSaveStateDTO,
  ): Promise<GeneralSaveStateDTO> {
    switch (domain(entity_id)) {
      case 'light':
        return await this.lightService.createSaveCommand(
          entity_id,
          current as GeneralSaveStateDTO<LightAttributesDTO>,
        );
      case 'switch':
        return await this.switchService.createSaveCommand(entity_id, current);
      case 'fan':
        return await this.fanService.createSaveCommand(
          entity_id,
          current as GeneralSaveStateDTO<FanAttributesDTO>,
        );
      case 'media_player':
        return await this.mediaService.createSaveCommand(entity_id, current);
      case 'lock':
        return await this.lockService.createSaveCommand(entity_id, current);
      case 'climate':
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
      url: `/entity/list`,
    });
  }

  public async pickInDomain(
    inList: string[] = [],
    omit: string[] = [],
    defaultValue?: string,
  ): Promise<string> {
    const entities = await this.list();
    const list = entities
      .filter(entity => {
        if (!is.empty(inList) && !inList.includes(domain(entity))) {
          return false;
        }
        if (omit.includes(entity)) {
          return false;
        }
        return true;
      })
      .map(i => [i, i] as PromptEntry);
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
      .filter(i => (is.empty(inList) ? true : inList.includes(i)))
      .map(i => [i, i] as MenuEntry);
    return await this.promptService.listBuild({
      current: entities.filter(i => current.includes(i[VALUE])),
      items: 'Entities',
      source: entities.filter(i => !current.includes(i[VALUE])),
    });
  }

  public async pickOne(inList: string[] = [], value?: string): Promise<string> {
    const entities = await this.list();
    return await this.promptService.menu({
      keyMap: {},
      right: ToMenuEntry(
        (is.empty(inList)
          ? entities
          : entities.filter(i => inList.includes(i))
        ).map(i => [i, i] as PromptEntry),
      ),
      value,
    });
  }

  public async process(id: string): Promise<void> {
    switch (domain(id)) {
      case 'light':
        await this.lightService.processId(id);
        return;
      case 'switch':
        await this.switchService.processId(id);
        return;
      case 'fan':
        await this.fanService.processId(id);
        return;
      case 'media_player':
        await this.mediaService.processId(id);
        return;
      case 'lock':
        await this.lockService.processId(id);
        return;
      case 'climate':
        await this.climateService.processId(id);
        return;
    }
    await this.baseService.processId(id);
  }

  public async processId(ids: string[]): Promise<void> {
    const entity = await this.promptService.menu({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry(ids.map(i => [i, i])),
    });
    if (IsDone(entity)) {
      return;
    }
    await this.process(entity);
  }

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set(
      'entity',
      async ({ target }) => await this.process(target),
    );
  }
}
