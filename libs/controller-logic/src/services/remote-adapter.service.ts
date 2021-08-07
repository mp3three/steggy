import { ControllerStates } from '@automagical/contracts/controller-logic';
import { PicoStates } from '@automagical/contracts/home-assistant';
import { EntityManagerService } from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

@Injectable()
export class RemoteAdapterService {
  // #region Object Properties

  private readonly lookup = new Map<string, Observable<ControllerStates>>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    private readonly entityManagerService: EntityManagerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public watch(entity_id: string): Observable<ControllerStates> {
    if (this.lookup.has(entity_id)) {
      return this.lookup.get(entity_id);
    }
    const observable = new Observable<ControllerStates>((subscription) => {
      this.entityManagerService.getObservable(entity_id).subscribe((state) => {
        switch (state.state as PicoStates) {
          case PicoStates.up:
            return subscription.next(ControllerStates.up);
          case PicoStates.down:
            return subscription.next(ControllerStates.down);
          case PicoStates.on:
            return subscription.next(ControllerStates.on);
          case PicoStates.off:
            return subscription.next(ControllerStates.off);
          case PicoStates.favorite:
            return subscription.next(ControllerStates.favorite);
          case PicoStates.none:
            return subscription.next(ControllerStates.none);
        }
      });
    });
    observable.subscribe((state) => {
      this.logger.fatal({ state });
    });
    this.lookup.set(entity_id, observable);
    return observable;
  }

  // #endregion Public Methods
}
