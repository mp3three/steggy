import {
  GroupService,
  StateManagerService,
} from '@automagical/controller-logic';
import { GENERIC_SUCCESS_RESPONSE } from '@automagical/server';
import { Controller, Delete, Param, Put } from '@nestjs/common';

@Controller(`/state`)
export class StateController {
  constructor(
    private readonly groupService: GroupService,
    private readonly statePersistence: StateManagerService,
  ) {}

  @Put('/:id/activate')
  public async setState(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.statePersistence.loadState(id);
    return GENERIC_SUCCESS_RESPONSE;
  }

  @Delete(`/:id`)
  public async deleteState(
    @Param('id') id: string,
  ): Promise<typeof GENERIC_SUCCESS_RESPONSE> {
    await this.statePersistence.deleteState(id);
    return GENERIC_SUCCESS_RESPONSE;
  }
}
