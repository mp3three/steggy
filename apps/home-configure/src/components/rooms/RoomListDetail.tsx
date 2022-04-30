import { RoomDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Empty, Form, Input, Space, Tabs, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { ItemPin, RoomMetadata } from '../misc';
import { RoomConfiguration } from './RoomConfiguration';
import { RoomExtraActions } from './RoomExtraActions';
import { RoomSaveStates } from './RoomSaveState';

export function RoomListDetail(props: {
  nested?: boolean;
  onClone?: (room: RoomDTO) => void;
  onUpdate: (room?: RoomDTO) => void;
  room?: RoomDTO;
}) {
  function renderBody() {
    return !props.room ? (
      <Empty description="Select a room" />
    ) : (
      <>
        <Space>
          <ItemPin type="room" target={props.room._id} />
          <Typography.Title
            level={3}
            editable={{
              onChange: friendlyName => update({ friendlyName }),
            }}
          >
            {props.room.friendlyName}
          </Typography.Title>
        </Space>
        <Tabs>
          <Tabs.TabPane key="members" tab="Members">
            <RoomConfiguration
              room={props.room}
              onUpdate={room => props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="save_states" tab="Save States">
            <RoomSaveStates
              room={props.room}
              onUpdate={room => props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="metadata" tab="Metadata">
            <RoomMetadata
              room={props.room}
              onUpdate={room => props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="settings" tab="Settings">
            <Card>
              <Form.Item label="Internal Name">
                <Input
                  defaultValue={props.room.name ?? `room_${props.room._id}`}
                  onBlur={({ target }) => update({ name: target.value })}
                />
              </Form.Item>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }

  async function update(body: Partial<RoomDTO>): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body,
      method: 'put',
      url: `/room/${props.room._id}`,
    });
    props.onUpdate(room);
  }

  if (props.nested) {
    return renderBody();
  }
  return (
    <Card
      title="Room details"
      extra={
        !is.object(props.room) ? undefined : (
          <RoomExtraActions
            room={props.room}
            onClone={props.onClone}
            onUpdate={props.onUpdate}
          />
        )
      }
    >
      {renderBody()}
    </Card>
  );
}
