import { LibraryModule } from '@steggy/boilerplate';

import { HOST, LIB_RCON, PASSWORD, PORT, TIMEOUT } from '../config';
import { RCONConnectionService } from '../services';

@LibraryModule({
  configuration: {
    [HOST]: {
      type: 'string',
      default: 'localhost',
      description: 'Where to connect to',
    },
    [PORT]: {
      type: 'number',
      description: 'Connection port',
      default: 25575,
    },
    [PASSWORD]: {
      type: 'password',
      description: 'Connection password',
    },
    [TIMEOUT]: {
      type: 'number',
      description: 'How long to wait until giving up',
      default: 5000,
    },
  },
  library: LIB_RCON,
  providers: [RCONConnectionService],
})
export class RCONModule {}
