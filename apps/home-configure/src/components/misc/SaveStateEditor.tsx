import { PersonDTO, RoomDTO, RoomStateDTO } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  notification,
  Popconfirm,
  Space,
} from 'antd';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoomStateEdit } from '../rooms';
import { RelatedRoutines } from '../routines';

export function SaveStateEditor(props: {
  onUpdate: (room: PersonDTO) => void;
  person?: PersonDTO;
  room?: RoomDTO;
}) {
  const [friendlyName, setFriendlyName] = useState('');

  const room = props.room ?? props.person;
  const routeBase = props.person ? 'person' : 'room';

  async function activateState(record: RoomStateDTO): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/${routeBase}/${room._id}/state/${record.id}`,
    });
  }

  async function removeState(record: RoomStateDTO): Promise<void> {
    const item = await sendRequest<RoomDTO>({
      method: 'delete',
      url: `/${routeBase}/${room._id}/state/${record.id}`,
    });
    props.onUpdate(item);
  }

  async function validate(): Promise<void> {
    try {
      if (is.empty(friendlyName)) {
        notification.error({
          message: 'Cannot have empty name',
        });
        return;
      }
      const item = await sendRequest<RoomDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/${routeBase}/${room._id}/state`,
      });
      setFriendlyName('');
      props.onUpdate(item);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Space style={{ width: '100%' }} direction="vertical" size="large">
      <Card
        type="inner"
        title="Save States"
        extra={
          <Popconfirm
            icon=""
            onConfirm={() => validate()}
            title={
              <Form.Item
                label="Friendly Name"
                name="friendlyName"
                rules={[{ required: true }]}
              >
                <Input
                  value={friendlyName}
                  onChange={({ target }) => setFriendlyName(target.value)}
                />
              </Form.Item>
            }
          >
            <Button
              size="small"
              type={is.empty(room.save_states) ? 'primary' : 'text'}
              icon={FD_ICONS.get('plus_box')}
            >
              Create new
            </Button>
          </Popconfirm>
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={room.save_states.sort((a, b) =>
            a.friendlyName > b.friendlyName ? UP : DOWN,
          )}
          renderItem={record => (
            <List.Item>
              <List.Item.Meta
                title={
                  <RoomStateEdit
                    key={record.id}
                    onUpdate={group => props.onUpdate(group)}
                    room={props.room}
                    person={props.person}
                    state={record}
                  />
                }
              />
              <Button
                onClick={() => activateState(record)}
                type="primary"
                size="small"
                icon={FD_ICONS.get('execute')}
              >
                Activate
              </Button>
              <Popconfirm
                icon={FD_ICONS.get('delete')}
                title={`Are you sure you want to delete ${record.friendlyName}`}
                onConfirm={() => removeState(record)}
              >
                <Button danger size="small" type="text">
                  X
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
      <Card type="inner" title="Used in routines">
        <RelatedRoutines roomState={room} />
      </Card>
    </Space>
  );
}
