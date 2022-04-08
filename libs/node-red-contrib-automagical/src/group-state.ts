import { is } from '@automagical/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { AutomagicalConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & AutomagicalConfiguration;
type TriggerOptions = { group?: string; state?: string };
type Payload = { group?: string; state?: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'group-state',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (group: string, state: string) => {
        await sendRequest({
          adminKey: server.admin_key,
          baseUrl: server.host,
          method: 'post',
          url: `/group/${group}/state/${state}`,
        });
      };

      this.on('input', async message => {
        const payload = message.payload as Payload;
        const group = payload.group || this.group;
        const state = payload.state || this.state;
        if (is.empty(group)) {
          this.error('Cannot identify group to activate save state on');
          return;
        }
        if (is.empty(state)) {
          this.error('Cannot identify group state to activate');
          return;
        }
        await activate(group, state);
      });
    },
  );
};
