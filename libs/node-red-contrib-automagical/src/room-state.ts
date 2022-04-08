import { is } from '@automagical/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { AutomagicalConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & AutomagicalConfiguration;
type TriggerOptions = { room?: string; state?: string };
type Payload = { room?: string; state?: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'room-state',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (room: string, state: string) => {
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          method: 'post',
          url: `/room/${room}/state/${state}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const room = payload.room || this.room;
        const state = payload.state || this.state;
        if (is.empty(room)) {
          this.error('Cannot identify room to activate save state on');
          return;
        }
        if (is.empty(state)) {
          this.error('Cannot identify room state to activate');
          return;
        }
        await activate(room, state);
      });
    },
  );
};
