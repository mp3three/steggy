import { is } from '@steggy/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & ControllerConfiguration;
type TriggerOptions = {
  property: string;
  room?: string;
  value?: unknown;
};
type Payload = {
  property: string;
  room?: string;
  value?: unknown;
};

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'set-metadata',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & TriggerOptions & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const send = async (target: string, property: string, value: unknown) => {
        const [base, room] = target.split(':');
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          body: { value },
          method: 'put',
          url: `/${base}/${room}/metadata-name/${property}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const room = payload.room || config.room;
        const property = payload.property || config.property;
        const value = payload.value ?? config.value;
        if (is.empty(room)) {
          this.error('No target provided to set metadata on');
          return;
        }
        if (is.empty(property)) {
          this.error('Cannot identify property to modify');
          return;
        }
        await send(room, property, value);
      });
    },
  );
};
