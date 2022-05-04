import { GroupDTO, GroupSaveStateDTO } from '@steggy/controller-shared';
import { DOWN, is, sleep, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  notification,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
import { GroupStateEdit } from './states';

export function GroupSaveStates(props: {
  group: GroupDTO;
  onGroupUpdate: (group?: GroupDTO) => void;
}) {
  const [friendlyName, setFriendlyName] = useState('');
  const HAS_ENTITIES = ['light', 'switch', 'fan', 'lock'].includes(
    props.group.type,
  );

  async function activateState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/group/${props.group._id}/state/${state.id}`,
    });
    await sleep(500);
    props.onGroupUpdate();
  }

  async function removeState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${props.group._id}/state/${state.id}`,
    });
    await sleep(500);
    props.onGroupUpdate();
  }

  async function validateCapture(): Promise<void> {
    try {
      if (is.empty(friendlyName)) {
        notification.error({
          message: 'Cannot have empty name',
        });
        return;
      }
      const group = await sendRequest<GroupDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/group/${props.group._id}/capture`,
      });
      notification.success({
        message: `State captured: ${friendlyName}`,
      });
      props.onGroupUpdate(group);
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  async function validateCreate(): Promise<void> {
    try {
      if (is.empty(friendlyName)) {
        notification.error({
          message: 'Cannot have empty name',
        });
        return;
      }
      const group = await sendRequest<GroupDTO>({
        body: { friendlyName },
        method: 'post',
        url: `/group/${props.group._id}/state`,
      });
      props.onGroupUpdate(group);
      setFriendlyName('');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        type="inner"
        title={<Typography.Text strong>Save States</Typography.Text>}
        key="states"
        extra={
          <Space>
            {HAS_ENTITIES ? (
              <Popconfirm
                icon={''}
                onConfirm={() => validateCapture()}
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
                placement="bottomLeft"
              >
                <Button size="small" type="text" icon={FD_ICONS.get('capture')}>
                  Capture current
                </Button>
              </Popconfirm>
            ) : undefined}
            <Popconfirm
              placement="bottomLeft"
              icon={''}
              onConfirm={() => validateCreate()}
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
              <Button size="small" type="text" icon={FD_ICONS.get('plus_box')}>
                Create new
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={(props.group?.save_states ?? []).sort((a, b) =>
            a.friendlyName > b.friendlyName ? UP : DOWN,
          )}
          renderItem={record => (
            <List.Item>
              <List.Item.Meta
                title={
                  <GroupStateEdit
                    onUpdate={group => props.onGroupUpdate(group)}
                    group={props.group}
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
                <Button danger type="text" size="small">
                  X
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
      <Card
        type="inner"
        title={<Typography.Text strong>Used In</Typography.Text>}
      >
        <RelatedRoutines groupState={props.group} />
      </Card>
    </Space>
  );
}
