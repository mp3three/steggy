import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutoLogService } from '@steggy/boilerplate';
import { CodeService } from '@steggy/controller-sdk';
import { CodeDTO } from '@steggy/controller-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import {
  AuthStack,
  GENERIC_SUCCESS_RESPONSE,
  Locals,
  ResponseLocals,
} from '@steggy/server';

@Controller('/code')
@AuthStack()
@ApiTags('code')
export class CodeController {
  constructor(private readonly code: CodeService) {}

  @Get('/tags')
  @ApiResponse({
    schema: {
      properties: {
        tags: { items: { type: 'string' }, type: 'array' },
      },
      type: 'object',
    },
  })
  @ApiOperation({
    description: `List all tags currently in use for code`,
  })
  public async routineTags(): Promise<{ tags: string[] }> {
    return {
      tags: await this.code.allTags(),
    };
  }
  @Post(`/`)
  @ApiBody({ type: CodeDTO })
  @ApiResponse({ type: CodeDTO })
  @ApiOperation({
    description: `Add some new code`,
  })
  public async create(@Body() data: CodeDTO): Promise<CodeDTO> {
    return await this.code.create(BaseSchemaDTO.cleanup(data));
  }

  @Delete(`/:code`)
  @ApiOperation({
    description: `Soft delete code`,
  })
  public async delete(
    @Param('code') code: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.code.delete(code);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Get('/:code')
  @ApiResponse({ type: CodeDTO })
  @ApiOperation({
    description: `Retrieve code info by id`,
  })
  public async get(
    @Param('code') code: string,
    @Locals() { control }: ResponseLocals,
  ): Promise<CodeDTO> {
    return await this.code.load(code, control);
  }

  @Get('/')
  @ApiResponse({ type: [CodeDTO] })
  @ApiOperation({
    description: `List all code`,
  })
  public async list(@Locals() { control }: ResponseLocals): Promise<CodeDTO[]> {
    return await this.code.list(control);
  }

  @Put(`/:code`)
  @ApiBody({ type: CodeDTO })
  @ApiResponse({ type: CodeDTO })
  @ApiOperation({
    description: `Modify a code entry`,
  })
  public async update(
    @Param('code') code: string,
    @Body() data: Partial<CodeDTO>,
    @Locals() { control }: ResponseLocals,
  ): Promise<CodeDTO> {
    await this.code.update(BaseSchemaDTO.cleanup(data), code);
    return await this.code.load(code, control);
  }
}
