import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetadataDTO } from '@steggy/controller-shared';
import { ApiGenericResponse, AuthStack } from '@steggy/server';

import { MetadataService } from '../services';

@Controller(`/metadata`)
@AuthStack()
@ApiTags('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Post('/')
  @ApiGenericResponse()
  public async create(@Body() metadata: MetadataDTO): Promise<MetadataDTO> {
    return await this.metadataService.create(metadata);
  }
}
