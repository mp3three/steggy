import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetadataService } from '@steggy/controller-sdk';
import { MetadataDTO } from '@steggy/controller-shared';
import { ApiGenericResponse, AuthStack } from '@steggy/server';

@Controller(`/metadata`)
@AuthStack()
@ApiTags('metadata')
export class MetadataController {
  constructor(private readonly metadata: MetadataService) {}

  @Post('/')
  @ApiGenericResponse()
  public async create(@Body() metadata: MetadataDTO): Promise<MetadataDTO> {
    return await this.metadata.create(metadata);
  }
}
