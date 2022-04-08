import {
  RoutineActivateOptionsDTO,
  RoutineDTO,
} from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { AutomagicalConfiguration } from './types';
import { sendRequest } from './types/fetch';

type tServer = Node & AutomagicalConfiguration;
type TriggerOptions = { routine: string };
type Payload = { routine: string | RoutineDTO };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'trigger-routine',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string },
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (
        routine: string,
        body?: RoutineActivateOptionsDTO,
      ) => {
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
        if (payload.routine) {
          if (is.string(payload.routine)) {
            await activate(payload.routine);
            return;
          }
          await activate(payload.routine._id);
          return;
        }
        if (is.empty(this.routine)) {
          this.error('Cannot identify routine to activate');
          return;
        }
        await activate(this.routine);
      });
    },
  );
};
