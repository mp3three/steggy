import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & ControllerConfiguration;
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

        await activate(group, state);
      });
    },
  );
};
