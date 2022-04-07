import { NodeAPI } from 'node-red';

export default function (RED: NodeAPI) {
  function RemoteServerNode(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.port = n.port;
  }
  RED.nodes.registerType('remote-server', RemoteServerNode);
}
