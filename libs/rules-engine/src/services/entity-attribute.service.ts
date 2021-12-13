import { EntityManagerService } from '@ccontour/home-assistant';
import { AutoLogService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import { get } from 'object-path';

import { EntityAttributeDTO } from '../contracts';

@Injectable()
export class EntityAttributeService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly manager: EntityManagerService,
  ) {}

  public async test(comparison: EntityAttributeDTO): Promise<boolean> {
    const entity = await this.manager.getEntity(comparison.entity_id);
    if (!entity) {
      this.logger.error(`Could not look up entity {${comparison.entity_id}}`);
      return false;
    }
    if (typeof comparison.state !== 'undefined') {
      const out = entity.state === comparison.state;
      if (typeof comparison.attribute === 'undefined') {
        return out;
      }
      if (out === false) {
        return false;
      }
    }
    const attribute = get(entity.attributes, comparison.attribute);
    return attribute === comparison.value;
  }
}
