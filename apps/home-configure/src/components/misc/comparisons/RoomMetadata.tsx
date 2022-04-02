import {
  RoomDTO,
  RoomMetadataComparisonDTO,
  RoomMetadataDTO,
} from '@automagical/controller-shared';
import { FILTER_OPERATIONS, is } from '@automagical/utilities';
import { Card, Form, Select, Skeleton } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

type tState = { rooms: RoomDTO[] };

export class RoomMetadataComparison extends React.Component<
  {
    comparison: RoomMetadataComparisonDTO;
    onUpdate: (value: Partial<RoomMetadataComparisonDTO>) => void;
  },
  tState
> {
  override state = { rooms: [] } as tState;

  private get room(): RoomDTO {
    return this.state.rooms.find(
      ({ _id }) => _id === this.props.comparison.room,
    );
  }

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
  }

  override render() {
    return (
      <Card title="State Comparison" type="inner">
        <Form.Item label="Room">
          <Select
            onChange={room => this.props.onUpdate({ room })}
            value={this.props.comparison.room}
          >
            {this.state.rooms.map(room => (
              <Select.Option value={room._id} key={room._id}>
                {room.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Property">
          {this.room ? (
            <FuzzySelect
              value={this.props.comparison.property}
              data={this.room.metadata.map((i: RoomMetadataDTO) => ({
                text: i.name,
                value: i.name,
              }))}
              onChange={property => this.props.onUpdate({ property })}
            />
          ) : (
            <Skeleton.Input />
          )}
        </Form.Item>
        <CompareValue
          operation={this.props.comparison.operation}
          value={this.props.comparison.value as FILTER_OPERATIONS}
          onUpdate={({ value, operation }) => {
            if (!is.undefined(value)) {
              this.props.onUpdate({ value });
            }
            if (!is.undefined(operation)) {
              this.props.onUpdate({ operation });
            }
          }}
        />
      </Card>
    );
  }

  private async listEntities() {
    const rooms = await sendRequest<RoomDTO[]>({
      control: { select: ['friendlyName', 'metadata'], sort: ['friendlyName'] },
      url: `/room`,
    });
    this.setState({ rooms });
  }
}
