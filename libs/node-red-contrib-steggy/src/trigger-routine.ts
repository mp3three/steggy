import { is } from '@steggy/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & ControllerConfiguration;
type TriggerOptions = { repeat: string; routine: string };
type Payload = { repeat: string; routine: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'trigger-routine',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string } & Payload,
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (routine: string, body) => {
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          body,
          method: 'post',
          url: `/routine/${routine}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const routine = payload.routine || this.routine || config.routine;
        const force = payload.repeat ?? this.repeat ?? config.repeat;
        if (is.empty(routine)) {
          this.error('Cannot identify routine to activate');
          return;
        }
        await activate(routine, {
          force: force === 'false' ? false : true,
        });
      });
    },
  );
};
