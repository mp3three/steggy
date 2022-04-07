import { Node, NodeAPI } from 'node-red';

module.exports = function (RED: NodeAPI) {
  RED.nodes.registerType(
    'lower-case',
    function LowerCaseNode(this: Node, config) {
      RED.nodes.createNode(this, config);
      this.on('input', message => {
        // message.payload = message.payload.toLowerCase();
        this.send(message);
      });
    },
  );
};
