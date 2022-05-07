import { RoutineActivateOptionsDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Node, NodeAPI, NodeDef } from 'node-red';

import { ControllerConfiguration, sendRequest } from './types';

type tServer = Node & ControllerConfiguration;
type TriggerOptions = { force: string; routine: string };
type Payload = { force: string; routine: string };

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'trigger-routine',
    function TriggerRoutineNode(
      this: Node & TriggerOptions,
      config: NodeDef & { server: string } & Payload,
    ) {
      RED.nodes.createNode(this, config);

      const server = RED.nodes.getNode(config.server) as tServer;
      const activate = async (
        routine: string,
        body: RoutineActivateOptionsDTO,
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
        const routine = payload.routine || this.routine || config.routine;
        let force: string | boolean =
          payload.force ?? this.force ?? config.force;
        if (is.empty(routine)) {
          this.error('Cannot identify routine to activate');
          return;
        }
        if (is.string(force)) {
          if (force === 'true') {
            force = true;
          } else if (force === 'false') {
            force = false;
          }
        }
        await activate(routine, {
          force: force as boolean,
          source: `[Node Red] ${config.name}`,
        });
      });
    },
  );
};
