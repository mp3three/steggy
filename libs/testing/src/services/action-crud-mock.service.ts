import { ActionCRUD, CrudOptions } from '@automagical/contracts';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { ActionDTO } from '@automagical/contracts/formio-sdk';
import { InjectLogger, toId, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

/**
 * Fulfills the ActionCRUD interface while doing a minimum of work to fulfill the interface
 */
@Injectable()
export class ActionCRUDMock implements ActionCRUD {
  // #region Object Properties

  private data = new Map<string, ActionDTO>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(ActionCRUDMock) private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async create(action: ActionDTO): Promise<ActionDTO> {
    action = ActionDTO.fake(action, true);
    this.data.set(action._id, action);
    return action;
  }

  @Trace()
  public async delete(action: ActionDTO | string): Promise<boolean> {
    this.data.delete(toId(action));
    return true;
  }

  @Trace()
  public async findById(action: string): Promise<ActionDTO> {
    return this.data.get(action);
  }

  @Trace()
  public async findMany(query: ResultControlDTO): Promise<ActionDTO[]> {
    this.logger.warn({ query }, `findMany returning everything`);
    return [...this.data.values()];
  }

  @Trace()
  public async update(
    source: ActionDTO,
    options: CrudOptions,
  ): Promise<ActionDTO> {
    this.logger.debug(
      {
        options,
        source,
      },
      'delete',
    );
    return source;
  }

  // #endregion Public Methods
}
