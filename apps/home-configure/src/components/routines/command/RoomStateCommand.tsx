import {
  RoomDTO,
  RoutineCommandRoomStateDTO,
} from '@automagical/controller-shared';
import { Form, Select, Skeleton, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  rooms: RoomDTO[];
};

export class RoomStateCommand extends React.Component<
  {
    command?: RoutineCommandRoomStateDTO;
    onUpdate: (command: Partial<RoutineCommandRoomStateDTO>) => void;
  },
  tState
> {
  override state = { rooms: [] } as tState;

  private get room(): RoomDTO {
    return this.state.rooms.find(({ _id }) => _id === this.props.command?.room);
  }

  override async componentDidMount(): Promise<void> {
    await this.listRooms();
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Room">
          <Select
            value={this.room?._id}
            onChange={room => this.props.onUpdate({ room })}
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
          {this.room ? (
            <Select
              value={this.props.command?.state}
              onChange={state => this.props.onUpdate({ state })}
            >
              {this.room.save_states.map(state => (
                <Select.Option key={state.id} value={state.id}>
                  {state.friendlyName}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Skeleton.Input style={{ width: '200px' }} active />
          )}
        </Form.Item>
      </Space>
    );
  }

  private async listRooms(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        select: ['friendlyName', 'save_states.id', 'save_states.friendlyName'],
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    this.setState({ rooms });
  }
}
