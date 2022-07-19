import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutoLogService } from '@steggy/boilerplate';
import {
  EntityCommandRouterService,
  EntityRenameService,
  EntityService,
  LightManagerService,
  MetadataService,
} from '@steggy/controller-sdk';
import {
  EntityHistoryRequest,
  GeneralSaveStateDTO,
  UpdateEntityIdDTO,
} from '@steggy/controller-shared';
import {
  EntityManagerService,
  HomeAssistantFetchAPIService,
} from '@steggy/home-assistant';
import {
  domain,
  EntityRegistryItemDTO,
  HassStateDTO,
  LightStateDTO,
} from '@steggy/home-assistant-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@steggy/server';

@ApiTags('entity')
@Controller('/entity')
@AuthStack()
export class EntityController {
  constructor(
    private readonly commandRouter: EntityCommandRouterService,
    private readonly entityManager: EntityManagerService,
    private readonly fetchAPI: HomeAssistantFetchAPIService,
    private readonly lightManager: LightManagerService,
    private readonly logger: AutoLogService,
    private readonly entityRename: EntityRenameService,
    private readonly metadata: MetadataService,
    private readonly entity: EntityService,
  ) {}

  @Post(`/flags/:id`)
  public async addFlag(
    @Param('id') entityId: string,
    @Body() { flag }: { flag: string },
  ): Promise<string[]> {
    await this.metadata.addFlag(entityId, flag);
    return await this.listFlags(entityId);
  }

  @Put('/update-id/:id')
  @ApiGenericResponse()
  @ApiBody({
    schema: {
      properties: { updateId: { type: 'string' } },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Update an entity id in the home assistant registry`,
  })
  public async changeId(
    @Body() update: UpdateEntityIdDTO,
    @Param('id') entityId: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.entityRename.changeId(entityId, update);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get(`/registry/:id`)
  @ApiResponse({ type: EntityRegistryItemDTO })
  @ApiOperation({
    description: `Retrieve entity registry data`,
  })
  public async fromRegistry(
    @Param('id') id: string,
  ): Promise<EntityRegistryItemDTO> {
    return await this.entityManager.fromRegistry(id);
  }

  @Get('/id/:entityId')
  @ApiResponse({ type: HassStateDTO })
  @ApiOperation({
    description: `Retrieve current entity state by id`,
  })
  public async getEntityState(
    @Param('entityId') entityId: string,
  ): Promise<HassStateDTO> {
    const out = await this.entityManager.getEntity(entityId);
    if (!out) {
      throw new NotFoundException();
    }
    return out;
  }

  @Post('/history/:entityId')
  public async history(
    @Param('entityId') entityId: string,
    @Body()
    { from, to }: EntityHistoryRequest,
  ): Promise<HassStateDTO[]> {
    return await this.fetchAPI.fetchEntityHistory(
      entityId,
      new Date(from),
      new Date(to),
    );
  }

  @Get('/list')
  @ApiResponse({
    schema: { items: { type: 'string' } },
  })
  @ApiOperation({
    description: `List not-ignored entity ids, supports result control.`,
  })
  public listAllEntities(@Locals() { control }: ResponseLocals): string[] {
    return this.entity.list(control).map(({ entity_id }) => entity_id);
  }

  @Get('/list-all')
  @ApiResponse({
    schema: { items: { type: 'string' } },
  })
  @ApiOperation({
    description: `List all known entity ids. Provided as unfiltered list.`,
  })
  public listEntities(): string[] {
    return this.entityManager.listEntities();
  }

  @Get('/flags/:entityId')
  public async listFlags(@Param('entityId') entity: string): Promise<string[]> {
    const metadata = await this.metadata.getMetadata(entity);
    return metadata?.data.flags ?? [];
  }

  @Post(`/record/:entityId`)
  @ApiResponse({ schema: { items: { type: 'object' } } })
  @ApiBody({
    schema: {
      properties: { duration: { type: 'string' } },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Watch an entity for state changes, return all observed results`,
  })
  public async record(
    @Param('entityId') id: string,
    @Body() { duration }: Record<'duration', number>,
  ): Promise<unknown[]> {
    return await this.entityManager.record(id, duration);
  }

  @Delete(`/flags/:id/:flag`)
  public async removeFlag(
    @Param('id') entityId: string,
    @Param('flag') flag: string,
  ): Promise<string[]> {
    await this.metadata.removeFlag(entityId, flag);
    return await this.listFlags(entityId);
  }

  @Put('/command/:id/:command')
  @ApiGenericResponse()
  @ApiBody({ schema: { type: 'object' } })
  @ApiOperation({
    description: `Process a generic entity command through the command router`,
  })
  public async routeCommand(
    @Param('id') id: string,
    @Param('command') command: string,
    @Body() body: Record<string, unknown>,
  ): Promise<HassStateDTO> {
    await this.commandRouter.process(id, command, body, true);
    const out = this.entityManager.getEntity(id);
    return out;
  }

  @Put(`/light-state/:id`)
  @ApiGenericResponse()
  @ApiBody({ type: GeneralSaveStateDTO })
  @ApiOperation({
    description: `Modify a light state using the light manager`,
  })
  public async setLightState(
    @Param('id') id: string,
    @Body() data: Partial<GeneralSaveStateDTO> = {},
  ): Promise<LightStateDTO> {
    if (domain(id) !== 'light' || !this.entityManager.isValidId(id)) {
      throw new BadRequestException();
    }
    await (data.state === 'off'
      ? this.lightManager.turnOff(id, true)
      : this.lightManager.turnOn(id, data, true));
    return this.entityManager.getEntity<LightStateDTO>(id);
  }

  /**
   * Change friendly name for an entity
   */
  @Put('/rename/:entityId')
  @ApiGenericResponse()
  @ApiBody({
    schema: {
      properties: { name: { type: 'string' } },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `Change the friendly name of an entity (affects home assistant registry)`,
  })
  public async updateEntity(
    @Param('entityId') entityId: string,
    @Body() body: Record<'name', string>,
  ): Promise<HassStateDTO> {
    if (!body?.name) {
      throw new BadRequestException(`No name provided`);
    }
    if (!this.entityManager.isValidId(entityId)) {
      throw new NotFoundException(`Could not find entity ${entityId}`);
    }
    const entity = await this.entityManager.updateFriendlyName(
      entityId,
      body.name,
    );
    return entity;
  }
}
