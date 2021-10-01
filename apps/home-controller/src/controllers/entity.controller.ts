import {
  EntityManagerService,
  HassStateDTO,
} from '@automagical/home-assistant';
import { AuthStack, GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import { AutoLogService } from '@automagical/utilities';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';

import { CommandRouter } from '../services';

@Controller('/entity')
@AuthStack()
export class EntityController {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly commandRouter: CommandRouter,
  ) {}

  @Get('/id/:entityId')
  public async getEntityState(
    @Param('entityId') entityId: string,
  ): Promise<HassStateDTO> {
    return await this.entityManager.getEntity([entityId]).shift();
  }

  @Get('/list')
  public listEntities(): string[] {
    return this.entityManager.listEntities();
  }

  @Put('/command/:id/:command')
  public async routeCommand(
    @Param('id') id: string,
    @Param('command') command: string,
    @Body() body: Record<string, unknown>,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.commandRouter.process(id, command, body);
    return GENERIC_SUCCESS_RESPONSE;
  }

  /**
   * Change friendly name for an entity
   */
  @Put('/rename/:entityId')
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
