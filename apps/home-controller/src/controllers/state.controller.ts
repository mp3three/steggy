import {
  GroupService,
  StateManagerService,
  StatePersistenceService,
} from '@automagical/controller-logic';
import { GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import { Controller, Delete, Param } from '@nestjs/common';

@Controller(`/state`)
export class StateController {
  constructor(
    private readonly groupService: GroupService,
    private readonly statePersistence: StateManagerService,
  ) {}

  @Delete('/:id')
  public async deleteState(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    return GENERIC_SUCCESS_RESPONSE;
  }
}
