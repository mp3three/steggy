import { StateChangeActivateDTO } from '@steggy/controller-shared';
import { PromptEntry, PromptService } from '@steggy/tty';
import { FILTER_OPERATIONS, FilterValueType, is } from '@steggy/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { EntityService } from '../../home-assistant/entity.service';

const CMP = `Comparison value`;

@Injectable()
export class StateChangeBuilderService {
  constructor(
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
  ) {}

  public async build(
    current: Partial<StateChangeActivateDTO> = {},
  ): Promise<StateChangeActivateDTO> {
    const entity = await this.entityService.pickInDomain(
      undefined,
      undefined,
      current.entity,
    );
    const operation = await this.promptService.pickOne(`Comparison type`, [
      // Don't think this applies, and I can't think of a label
      // ['elem', 'elem'],
      // Basics
      ['Equals', FILTER_OPERATIONS.eq],
      ['Not Equals', FILTER_OPERATIONS.ne],
      // Numeric
      ['Less Than', FILTER_OPERATIONS.lt],
      ['Less Than or Equals', FILTER_OPERATIONS.lte],
      ['Greater Than', FILTER_OPERATIONS.gt],
      ['Greater Than or Equals', FILTER_OPERATIONS.gte],
      // Arrays
      ['In List', FILTER_OPERATIONS.in],
      ['Not In List', FILTER_OPERATIONS.nin],
      // Misc
      ['Regular Expression Match', FILTER_OPERATIONS.regex],
    ] as PromptEntry<FILTER_OPERATIONS>[]);
    const value = await this.getValue(operation, current.value);
    const latch = await this.promptService.boolean('Latch', current.latch);

    return {
      entity,
      id: current.id ?? uuid(),
      latch,
      operation,
      value,
    };
  }

  private async getValue(
    operation: FILTER_OPERATIONS,
    current?: FilterValueType | FilterValueType[],
  ): Promise<FilterValueType | FilterValueType[]> {
    switch (operation) {
      case FILTER_OPERATIONS.eq:
      case FILTER_OPERATIONS.ne:
        return await this.promptService.string(
          CMP,
          is.string(current) ? current : ``,
        );
      case FILTER_OPERATIONS.lt:
      case FILTER_OPERATIONS.lte:
      case FILTER_OPERATIONS.gt:
      case FILTER_OPERATIONS.gte:
        return await this.numericValue(
          Array.isArray(current) ? undefined : current,
        );
      case FILTER_OPERATIONS.in:
      case FILTER_OPERATIONS.nin:
        return await this.listValue(Array.isArray(current) ? current : []);
      case FILTER_OPERATIONS.regex:
        return await this.regexValue(is.string(current) ? current : ``);
    }
    return [];
  }

  private async listValue(
    current: FilterValueType[],
  ): Promise<FilterValueType[]> {
    const values = await this.promptService.editor(
      `Newline separated values`,
      current.join(`\n`),
    );
    return values.split(`\n`);
  }

  private async numericValue(
    current?: FilterValueType,
  ): Promise<FilterValueType> {
    const type = await this.promptService.pickOne(`Value type`, [
      ['Number', 'number'],
      ['Date', 'date'],
      ['Time', 'time'],
      ['Timestamp', 'timestamp'],
    ]);
    switch (type) {
      case 'number':
        return await this.promptService.number(
          CMP,
          is.number(current) ? current : undefined,
        );
      case 'date':
        return this.promptService.date(
          undefined,
          current instanceof Date ? current : undefined,
        );
      case 'time':
        return this.promptService.time(
          undefined,
          current instanceof Date ? current : undefined,
        );
      case 'timestamp':
        return this.promptService.timestamp(
          undefined,
          current instanceof Date ? current : undefined,
        );
    }
    throw new NotImplementedException();
  }

  private async regexValue(current: string): Promise<string> {
    return await this.promptService.string(`Expression`, current, {
      prefix: `/`,
      suffix: `/gi`,
    });
  }
}
