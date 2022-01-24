import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutoLogService } from '@text-based/boilerplate';
import {
  EntityCommandRouterService,
  LightManagerService,
} from '@text-based/controller-logic';
import {
  EntityHistoryRequest,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-shared';
import {
  EntityManagerService,
  HomeAssistantFetchAPIService,
} from '@text-based/home-assistant';
import {
  domain,
  EntityRegistryItemDTO,
  HASS_DOMAINS,
  HassStateDTO,
  LightStateDTO,
} from '@text-based/home-assistant-shared';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@text-based/server';

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
  ) {}

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
    @Body() { updateId }: Record<'updateId', string>,
    @Param('id') entityId: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    const result = await this.entityManager.updateId(entityId, updateId);
    this.logger.info({ result });
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get(`/registry/:id`)
  @ApiResponse({ type: EntityRegistryItemDTO })
  @ApiOperation({
    description: `Retreive entity regristry data`,
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
  ): Promise<unknown[]> {
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
    description: `List all known entity ids`,
  })
  public listEntities(): string[] {
    return this.entityManager.listEntities();
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
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.commandRouter.process(id, command, body);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Put(`/light-state/:id`)
  @ApiGenericResponse()
  @ApiBody({ type: RoomEntitySaveStateDTO })
  @ApiOperation({
    description: `Modify a light state using the light manager`,
  })
  public async setLightState(
    @Param('id') id: string,
    @Body() data: Partial<RoomEntitySaveStateDTO> = {},
  ): Promise<LightStateDTO> {
    if (
      domain(id) !== HASS_DOMAINS.light ||
      !this.entityManager.isValidId(id)
    ) {
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
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    if (!body?.name) {
      throw new BadRequestException(`No name provided`);
    }
    if (!this.entityManager.isValidId(entityId)) {
      throw new NotFoundException(`Could not find entity ${entityId}`);
    }
    const result = await this.entityManager.updateFriendlyName(
      entityId,
      body.name,
    );
    this.logger.info({ result });
    return GENERIC_SUCCESS_RESPONSE;
  }
}
