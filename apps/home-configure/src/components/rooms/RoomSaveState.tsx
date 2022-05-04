import { RoomDTO, RoomStateDTO } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
import { RoomStateEdit } from './states';

export function RoomSaveStates(props: {
  onUpdate: (room: RoomDTO) => void;
  room: RoomDTO;
}) {
  const [friendlyName, setFriendlyName] = useState('');

  async function activateState(record: RoomStateDTO): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/room/${props.room._id}/state/${record.id}`,
    });
  }

  async function removeState(record: RoomStateDTO): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      method: 'delete',
      url: `/room/${props.room._id}/state/${record.id}`,
    });
    props.onUpdate(room);
  }

  async function validate(): Promise<void> {
    try {
      const room = await sendRequest<RoomDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/room/${props.room._id}/state`,
      });
      props.onUpdate(room);
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Space style={{ width: '100%' }} direction="vertical" size="large">
      <Card
        type="inner"
        title={<Typography.Text strong>Save States</Typography.Text>}
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
              type={is.empty(props.room.save_states) ? 'primary' : 'text'}
              icon={FD_ICONS.get('plus_box')}
            >
              Create new
            </Button>
          </Popconfirm>
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={props.room.save_states.sort((a, b) =>
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
      <Card
        type="inner"
        title={<Typography.Text strong>Used in routines</Typography.Text>}
      >
        <RelatedRoutines roomState={props.room} />
      </Card>
    </Space>
  );
}
