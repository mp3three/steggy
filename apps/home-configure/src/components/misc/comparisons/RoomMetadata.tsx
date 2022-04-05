import {
  ROOM_METADATA_TYPES,
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

const AVAILABLE_OPERATIONS = new Map<
  `${ROOM_METADATA_TYPES}`,
  `${FILTER_OPERATIONS}`[]
>([
  ['string', ['eq', 'ne', 'in', 'nin', 'regex']],
  // Is there any other relevant options?
  ['boolean', ['eq', 'ne']],
  ['number', ['eq', 'ne', 'in', 'nin', 'lt', 'lte', 'gt', 'gte']],
  ['enum', ['eq', 'ne', 'in', 'nin', 'regex']],
  // Should gte / lte be allowed?
  // Unclear if it's possible for dates to "equal" for more than 1 ms
  ['date', ['gt', 'gte', 'lt', 'lte']],
]);

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

  private get metadata(): RoomMetadataDTO {
    const room = this.room;
    const metadata = (room?.metadata ?? []).find(
      ({ name }) => name === this.props.comparison?.property,
    );
    return metadata;
  }

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
  }

  override render() {
    const metadata = this.metadata;
    const type = metadata?.type;
    return (
      <Card title="Metadata Comparison" type="inner">
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
          valueOptions={type === 'enum' ? metadata.options ?? [] : undefined}
          operation={this.props.comparison.operation}
          availableOperations={AVAILABLE_OPERATIONS.get(type)}
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
