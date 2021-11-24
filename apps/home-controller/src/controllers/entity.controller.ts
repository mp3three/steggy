import {
  EntityCommandRouterService,
  LightingCacheDTO,
  LightManagerService,
} from '@ccontour/controller-logic';
import {
  domain,
  EntityManagerService,
  EntityRegistryItemDTO,
  HASS_DOMAINS,
  HassStateDTO,
} from '@ccontour/home-assistant';
import {
  ApiGenericResponse,
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
} from '@ccontour/server';
import { AutoLogService } from '@ccontour/utilities';
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
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('entity')
@Controller('/entity')
@AuthStack()
export class EntityController {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly commandRouter: EntityCommandRouterService,
    private readonly lightManager: LightManagerService,
  ) {}

  @Put('/update-id/:id')
  @ApiGenericResponse()
  @ApiBody({
    schema: {
      properties: { updateId: { type: 'string' } },
      type: 'object',
    },
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
  public async fromRegistry(
    @Param('id') id: string,
  ): Promise<EntityRegistryItemDTO> {
    return await this.entityManager.fromRegistry(id);
  }

  @Get('/id/:entityId')
  @ApiResponse({ type: HassStateDTO })
  public async getEntityState(
    @Param('entityId') entityId: string,
  ): Promise<HassStateDTO> {
    return await this.entityManager.getEntity(entityId);
  }

  @Get('/list')
  @ApiResponse({
    schema: { items: { type: 'string' } },
  })
  public listEntities(): string[] {
    return this.entityManager.listEntities();
  }

  @Post(`/record/:entityId`)
  @ApiResponse({ schema: { type: 'object' } })
  @ApiBody({
    schema: {
      properties: { duration: { type: 'string' } },
      type: 'object',
    },
  })
  public async record(
    @Param('entityId') id: string,
    @Body() { duration }: Record<'duration', number>,
  ): Promise<unknown> {
    return await this.entityManager.record(id, duration);
  }

  @Put('/command/:id/:command')
  @ApiGenericResponse()
  @ApiBody({ schema: { type: 'object' } })
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
  @ApiBody({ type: LightingCacheDTO })
  public async setLightState(
    @Param('id') id: string,
    @Body() data: Partial<LightingCacheDTO> = {},
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    if (
      domain(id) !== HASS_DOMAINS.light ||
      !this.entityManager.isValidId(id)
    ) {
      throw new BadRequestException();
    }

    await this.lightManager.turnOn(id, data);
    return GENERIC_SUCCESS_RESPONSE;
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
