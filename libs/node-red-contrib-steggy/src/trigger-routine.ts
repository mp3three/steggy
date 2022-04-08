import { is } from '@steggy/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { AutomagicalConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & AutomagicalConfiguration;
type TriggerOptions = { routine: string };
type Payload = { routine: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'trigger-routine',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (routine: string) => {
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          method: 'post',
          url: `/routine/${routine}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const routine = payload.routine || this.routine;
        if (is.empty(routine)) {
          this.error('Cannot identify routine to activate');
          return;
        }
        await activate(routine);
      });
    },
  );
};
