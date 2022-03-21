import { RoutineDTO } from '@automagical/controller-shared';
import { TitleCase } from '@automagical/utilities';
import { Button, Divider, List, Popconfirm, Space, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tState = {
  name: string;
};

export class RoutineMiniActivate extends React.Component<
  {
    onUpdate: () => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Title level={5}>Activation Events</Typography.Title>
        <List
          dataSource={this.props.routine.activate}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.friendlyName}
                description={TitleCase(item.type)}
              />
              <Popconfirm
                title="Are you sure you want to delete this activation event"
                onConfirm={() => this.deleteActivate(item.id)}
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
          dataSource={this.props.routine.command}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.friendlyName}
                description={TitleCase(item.type)}
              />
              <Popconfirm
                title="Are you sure you want to delete this command"
                onConfirm={() => this.deleteCommand(item.id)}
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

  private async deleteActivate(id: string): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${this.props.routine._id}/activate/${id}`,
    });
    this.props.onUpdate();
  }

  private async deleteCommand(id: string): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${this.props.routine._id}/command/${id}`,
    });
    this.props.onUpdate();
  }
}
