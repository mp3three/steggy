import { EntityManagerService } from '@automagical/home-assistant';
import { GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import { AutoLogService } from '@automagical/utilities';
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';

@Controller('/entity')
export class EntityController {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
  ) {}

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
