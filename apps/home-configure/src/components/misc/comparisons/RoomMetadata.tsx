import {
  MetadataComparisonDTO,
  PersonDTO,
  ROOM_METADATA_TYPES,
  RoomDTO,
  RoomMetadataDTO,
} from '@steggy/controller-shared';
import { FILTER_OPERATIONS, is } from '@steggy/utilities';
import { Card, Form, Select, Skeleton } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

type tState = {
  people: PersonDTO[];
  rooms: RoomDTO[];
};

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
    comparison: MetadataComparisonDTO;
    onUpdate: (value: Partial<MetadataComparisonDTO>) => void;
    unwrap?: boolean;
  },
  tState
> {
  override state = { people: [], rooms: [] } as tState;

  private get target(): RoomDTO {
    const person = this.state.people.find(
      ({ _id }) => _id === this.props.comparison?.room,
    );
    if (person) {
      return person;
    }
    return this.state.rooms.find(
      ({ _id }) => _id === this.props.comparison?.room,
    );
  }

  private get metadata(): RoomMetadataDTO {
    const room = this.target;
    const metadata = (room?.metadata ?? []).find(
      ({ name }) => name === this.props.comparison?.property,
    );
    return metadata;
  }

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
  }

  override render() {
    if (this.props.unwrap) {
      return this.renderBody();
    }
    return (
      <Card title="Metadata Comparison" type="inner">
        {this.renderBody()}
      </Card>
    );
  }

  private async listEntities() {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'metadata.0',
            operation: 'exists',
            value: true,
          },
        ]),
        select: ['friendlyName', 'metadata'],
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    const people = await sendRequest<PersonDTO[]>({
      control: {
        filters: new Set([
          {
            field: 'metadata.0',
            operation: 'exists',
            value: true,
          },
        ]),
        select: ['friendlyName', 'metadata'],
        sort: ['friendlyName'],
      },
      url: `/person`,
    });
    this.setState({ people, rooms });
  }

  private renderBody() {
    const metadata = this.metadata;
    const type = metadata?.type;
    return (
      <>
        <Form.Item label="Source">
          <Select
            onChange={room => this.sourceUpdate(room)}
            value={this.props.comparison?.room}
          >
            <Select.OptGroup label="Room">
              {this.state.rooms.map(room => (
                <Select.Option value={room._id} key={room._id}>
                  {room.friendlyName}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Person">
              {this.state.people.map(person => (
                <Select.Option value={person._id} key={person._id}>
                  {person.friendlyName}
                </Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </Form.Item>
        <Form.Item label="Property">
          {this.target ? (
            <FuzzySelect
              disabled={is.empty(this.props.comparison.room)}
              value={this.props.comparison?.property}
              data={this.target.metadata.map((i: RoomMetadataDTO) => ({
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
          disabled={is.empty(this.props.comparison?.room)}
          valueOptions={type === 'enum' ? metadata.options ?? [] : undefined}
          operation={this.props.comparison?.operation}
          availableOperations={AVAILABLE_OPERATIONS.get(type)}
          value={this.props.comparison?.value as FILTER_OPERATIONS}
          onUpdate={({ value, operation }) => {
            if (!is.undefined(value)) {
              this.props.onUpdate({ value });
            }
            if (!is.undefined(operation)) {
              this.props.onUpdate({ operation });
            }
          }}
        />
      </>
    );
  }

  private sourceUpdate(room: string): void {
    const type = is.object(this.state.rooms.find(({ _id }) => _id === room))
      ? 'room'
      : 'person';
    this.props.onUpdate({
      operation: undefined,
      property: undefined,
      room,
      type,
      value: undefined,
    });
  }
}
