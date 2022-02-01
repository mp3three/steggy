import {
  RoomDTO,
  RoutineCommandRoomStateDTO,
} from '@text-based/controller-shared';
import { Form, Select, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  room: RoomDTO;
  rooms: RoomDTO[];
  state: string;
};

export class RoomStateCommand extends React.Component<
  { command?: RoutineCommandRoomStateDTO },
  tState
> {
  override async componentDidMount(): Promise<void> {
    await this.listRooms();
    const { command } = this.props;
    if (command) {
      this.setState({
        room: this.state.rooms.find(({ _id }) => _id === command.room),
        state: command.state,
      });
    }
  }

  public getValue(): RoutineCommandRoomStateDTO {
    return {
      room: this.state.room,
      state: this.state.state,
    };
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Room">
          <Select
            value={this.state.room}
            onChange={this.roomChange.bind(this)}
            showSearch
            style={{ width: '100%' }}
          >
            {this.state.rooms.map(group => (
              <Select.Option key={group._id} value={group._id}>
                {group.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Save State">
          <Select onChange={state => this.setState({ state })}>
            {this.state.room.save_states.map(state => (
              <Select.Option key={state.id} value={state.id}>
                {state.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Space>
    );
  }
  private async listRooms(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>(
      `/room?select=friendlyName,save_states.id,save_states.friendlyName&sort=friendlyName`,
    );
    this.setState({ rooms });
  }

  private roomChange(room: string): void {
    this.setState({
      room: this.state.rooms.find(({ _id }) => _id === room),
    });
  }
}
