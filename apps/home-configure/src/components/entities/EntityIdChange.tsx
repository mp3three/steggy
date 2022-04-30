import { UpdateEntityIdDTO } from '@steggy/controller-shared';
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Typography,
} from 'antd';
import React, { useState } from 'react';

import { domain, sendRequest } from '../../types';

export function EntityIdChange(props: {
  entity: string;
  onRename: (entity: string) => void;
}) {
  const [update, setUpdate] = useState<UpdateEntityIdDTO>(
    {} as UpdateEntityIdDTO,
  );
  const [id, setId] = useState('');
  const [visible, setVisible] = useState(false);

  async function change(): Promise<void> {
    if (id === props.entity.split('.')[1]) {
      notification.error({
        message: `entity_id not changed`,
      });
      return;
    }
    const updateId = `${domain(props.entity)}.${id}`;
    await sendRequest({
      body: {
        groups: update.groups,
        id,
        rooms: update.rooms,
        routines: update.routines,
      } as UpdateEntityIdDTO,
      method: 'put',
      url: `/entity/update-id/${props.entity}`,
    });
    props.onRename(updateId);
    setVisible(false);
    notification.success({
      message: (
        <Typography>
          <Typography.Text code>{props.entity}</Typography.Text>
          {` renamed to `}
          <Typography.Text code>{updateId}</Typography.Text>
        </Typography>
      ),
    });
  }
  return (
    <>
      <Modal
        onCancel={() => setVisible(false)}
        onOk={() => change()}
        visible={visible}
        title={
          <Typography>
            {`Change Entity ID: `}
            <Typography.Text code>{props.entity}</Typography.Text>
          </Typography>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item label="Entity ID">
            <Input
              prefix={
                <Typography.Text code>{domain(props.entity)}</Typography.Text>
              }
              value={id}
              onChange={({ target }) => setId(target.value)}
            />
          </Form.Item>
          <Divider orientation="left">Update References</Divider>
          <Checkbox
            onChange={({ target }) =>
              setUpdate({ ...update, groups: target.checked })
            }
            checked={update.groups}
          >
            Update Groups + Save States
          </Checkbox>
          <Checkbox
            onChange={({ target }) =>
              setUpdate({ ...update, rooms: target.checked })
            }
            checked={update.rooms}
          >
            Update Rooms + Save States
          </Checkbox>
          <Checkbox
            onChange={({ target }) =>
              setUpdate({ ...update, routines: target.checked })
            }
            checked={update.routines}
          >
            Update Routines
          </Checkbox>
        </Space>
      </Modal>
      <Button
        danger
        onClick={() => {
          setVisible(true);
          setId(props.entity.split('.')[1]);
        }}
      >
        Change Entity ID
      </Button>
    </>
  );
}
