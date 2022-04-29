import {
  MetadataComparisonDTO,
  PersonDTO,
  ROOM_METADATA_TYPES,
  RoomDTO,
  RoomMetadataDTO,
} from '@steggy/controller-shared';
import { FILTER_OPERATIONS, is } from '@steggy/utilities';
import { Card, Form, Select, Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

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

// eslint-disable-next-line radar/cognitive-complexity
export function RoomMetadataComparison(props: {
  comparison: MetadataComparisonDTO;
  onUpdate: (value: Partial<MetadataComparisonDTO>) => void;
  unwrap?: boolean;
}) {
  const [people, setPeople] = useState<PersonDTO[]>();
  const [rooms, setRooms] = useState<RoomDTO[]>();

  // override async componentDidMount(): Promise<void> {
  //   await this.listEntities();
  // }
  useEffect(() => {
    async function listEntities() {
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
      setPeople(people);
      setRooms(rooms);
    }
    listEntities();
  }, []);

  function target(): RoomDTO {
    const person = people.find(({ _id }) => _id === props.comparison?.room);
    if (person) {
      return person;
    }
    return rooms.find(({ _id }) => _id === props.comparison?.room);
  }

  function metadata(): RoomMetadataDTO {
    const room = target();
    const metadata = (room?.metadata ?? []).find(
      ({ name }) => name === props.comparison?.property,
    );
    return metadata;
  }

  function renderBody() {
    const meta = metadata();
    const type = meta?.type;
    const item = target();
    return (
      <>
        <Form.Item label="Source">
          <Select
            onChange={room => sourceUpdate(room)}
            value={props.comparison?.room}
          >
            <Select.OptGroup label="Room">
              {rooms.map(room => (
                <Select.Option value={room._id} key={room._id}>
                  {room.friendlyName}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Person">
              {people.map(person => (
                <Select.Option value={person._id} key={person._id}>
                  {person.friendlyName}
                </Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </Form.Item>
        <Form.Item label="Property">
          {item ? (
            <FuzzySelect
              disabled={is.empty(props.comparison.room)}
              value={props.comparison?.property}
              data={item.metadata.map((i: RoomMetadataDTO) => ({
                text: i.name,
                value: i.name,
              }))}
              onChange={property => props.onUpdate({ property })}
            />
          ) : (
            <Skeleton.Input />
          )}
        </Form.Item>
        <CompareValue
          disabled={is.empty(props.comparison?.room)}
          valueOptions={type === 'enum' ? meta.options ?? [] : undefined}
          operation={props.comparison?.operation}
          availableOperations={AVAILABLE_OPERATIONS.get(type)}
          value={props.comparison?.value as FILTER_OPERATIONS}
          numberType={type}
          onUpdate={({ value, operation }) => {
            if (!is.undefined(value)) {
              props.onUpdate({ value });
            }
            if (!is.undefined(operation)) {
              props.onUpdate({ operation });
            }
          }}
        />
      </>
    );
  }

  function sourceUpdate(room: string): void {
    const type = is.object(rooms.find(({ _id }) => _id === room))
      ? 'room'
      : 'person';
    props.onUpdate({
      operation: undefined,
      property: undefined,
      room,
      type,
      value: undefined,
    });
  }

  if (props.unwrap) {
    return renderBody();
  }
  return (
    <Card title="Metadata Comparison" type="inner">
      {renderBody()}
    </Card>
  );
}
