import {
  RoomDTO,
  SetRoomMetadataCommandDTO,
} from '@automagical/controller-shared';
import { Checkbox, Form, Input, Select, Skeleton, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  rooms: Pick<RoomDTO, '_id' | 'friendlyName' | 'metadata'>[];
};

export class RoomSetMetadataCommand extends React.Component<
  {
    command?: SetRoomMetadataCommandDTO;
    onUpdate: (command: Partial<SetRoomMetadataCommandDTO>) => void;
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
        <Form.Item label="Property">
          {this.room ? (
            <Select
              value={this.props.command?.name}
              onChange={name => this.props.onUpdate({ name })}
            >
              {(this.room.metadata ?? []).map(state => (
                <Select.Option key={state.id} value={state.name}>
                  {state.name}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Skeleton.Input style={{ width: '200px' }} active />
          )}
        </Form.Item>
        <Form.Item label="Value">{this.renderValue()}</Form.Item>
      </Space>
    );
  }

  private async listRooms(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        select: ['friendlyName', 'metadata'],
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    this.setState({ rooms });
  }

  private renderValue() {
    if (!this.room) {
      return <Skeleton.Input active />;
    }
    const metadata = this.room.metadata.find(
      ({ name }) => name === this.props.command.name,
    );
    if (!metadata) {
      return <Skeleton.Input active />;
    }
    if (metadata.type === 'boolean') {
      return (
        <Checkbox
          checked={Boolean(this.props.command.value)}
          onChange={({ target }) =>
            this.props.onUpdate({ value: target.checked })
          }
        />
      );
    }
    return (
      <Input
        value={String(this.props.command.value)}
        onChange={({ target }) => this.props.onUpdate({ value: target.value })}
      />
    );
  }
}
