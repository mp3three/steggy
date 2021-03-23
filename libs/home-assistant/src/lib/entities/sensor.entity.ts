import { SocketService } from '../../home-assistant/socket/socket.service';
import { BaseEntity } from './base.entity';

export class SensorEntity extends BaseEntity {
  constructor(entityId: string, socketService: SocketService) {
    super(entityId, socketService);
    this.init();
  }

  private init() {
    this.picoInit();
  }

  private picoInit() {
    this.on('update', () => {
      this.emit(`pico`);
    });
  }
}
