import { SocketService } from '..';
import { BaseEntity } from './base.entity';

export class SensorEntity extends BaseEntity {
  // #region Constructors

  constructor(entityId: string, socketService: SocketService) {
    super(entityId, socketService);
    this.init();
  }

  // #endregion Constructors

  // #region Private Methods

  private init() {
    this.picoInit();
  }

  private picoInit() {
    this.on('update', () => {
      this.emit(`pico`);
    });
  }

  // #endregion Private Methods
}
