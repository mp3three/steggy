import { RoutineDTO } from '@steggy/controller-shared';
import { TitleCase } from '@steggy/utilities';
import { Button, Divider, List, Popconfirm, Space, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

export function RoutineMiniActivate(props: {
  onUpdate: () => void;
  routine: RoutineDTO;
}) {
  async function deleteActivate(id: string): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${props.routine._id}/activate/${id}`,
    });
    props.onUpdate();
  }

  async function deleteCommand(id: string): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${props.routine._id}/command/${id}`,
    });
    props.onUpdate();
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Title level={5}>Activation Events</Typography.Title>
      <List
        pagination={{ size: 'small' }}
        dataSource={props.routine.activate}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.friendlyName}
              description={TitleCase(item.type)}
            />
            <Popconfirm
              title="Are you sure you want to delete this activation event"
              onConfirm={() => deleteActivate(item.id)}
            >
              <Button danger type="text">
                X
              </Button>
            </Popconfirm>
          </List.Item>
        )}
      />
      <Divider />
      <Typography.Title level={5}>Commands</Typography.Title>
      <List
        pagination={{ size: 'small' }}
        dataSource={props.routine.command}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.friendlyName}
              description={TitleCase(item.type)}
            />
            <Popconfirm
              title="Are you sure you want to delete this command"
              onConfirm={() => deleteCommand(item.id)}
            >
              <Button danger type="text">
                X
              </Button>
            </Popconfirm>
          </List.Item>
        )}
      />
    </Space>
  );
}
