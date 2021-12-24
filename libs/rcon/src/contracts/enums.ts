/* eslint-disable @typescript-eslint/no-magic-numbers */
export enum State {
  Disconnected = 0,
  Connecting = 0.5,
  Connected = 1,
  Authorized = 2,
  Refused = -1,
  Unauthorized = -2,
}

export enum PacketType {
  AUTH = 0x03, // outgoing
  COMMAND = 0x02, // outgoing
  RESPONSE_AUTH = 0x02, // incoming
}
