import { is } from '@steggy/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & ControllerConfiguration;
type TriggerOptions = { person?: string; state?: string };
type Payload = { person?: string; state?: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'person-state',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & TriggerOptions & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (person: string, state: string) => {
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          method: 'post',
          url: `/person/${person}/state/${state}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const person = payload.person || config.person;
        const state = payload.state || config.state;
        if (is.empty(person)) {
          this.error('Cannot identify person to activate save state on');
          return;
        }
        if (is.empty(state)) {
          this.error('Cannot identify person state to activate save state on');
          return;
        }
        await activate(person, state);
      });
    },
  );
};
