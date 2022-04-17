import MenuIcon from '@2fd/ant-design-icons/lib/Menu';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  List,
  Menu,
  Popconfirm,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityInspectButton, EntityModalPicker } from '../entities';
import { RelatedRoutines } from '../routines';
import { GroupSaveStates } from './GroupSaveState';
import { GroupUsedIn } from './GroupUsedIn';

type tState = {
  name: string;
};

export class GroupListDetail extends React.Component<
  { group: GroupDTO; onUpdate: (group?: GroupDTO) => void; type?: 'inner' },
  tState
> {
  override state = {} as tState;

  override render() {
    if (this.props.type === 'inner') {
      return this.renderContents();
    }
    return (
      <Card
        title="Group Settings"
        extra={
          !is.object(this.props.group) ? undefined : (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="delete">
                    <Popconfirm
                      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                      title={`Are you sure you want to delete ${this.props.group.friendlyName}?`}
                      onConfirm={() => this.delete()}
                    >
                      <Button danger type="text">
                        Delete Group
                      </Button>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text">
                <MenuIcon />
              </Button>
            </Dropdown>
          )
        }
      >
        {this.renderContents()}
      </Card>
    );
  }

  private async addEntities(entities: string[]): Promise<void> {
    const { group } = this.props;
    group.entities = is.unique([...group.entities, ...entities]);
    this.props.onUpdate(
      await sendRequest({
        body: {
          entities: group.entities,
        } as Partial<GroupDTO>,
        method: 'put',
        url: `/group/${group._id}`,
      }),
    );
  }

  private async delete(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${this.props.group._id}`,
    });
    this.props.onUpdate();
  }

  private domainList(): string[] {
    const { group } = this.props;
    switch (group.type) {
      case 'light':
        return ['light'] as string[];
      case 'switch':
        return ['light', 'fan', 'switch', 'climate'];
      case 'lock':
        return ['lock'];
      case 'fan':
        return ['fan'];
    }
    return [];
  }

  private groupActions() {
    if (this.props.group.type === 'light') {
      return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="large">
            <Button
              type="primary"
              onClick={() => this.lightCommand('circadianOn')}
            >
              Circadian
            </Button>
            <Button type="primary" onClick={() => this.lightCommand('turnOff')}>
              Off
            </Button>
            <Button type="primary" onClick={() => this.lightCommand('turnOn')}>
              On
            </Button>
          </Space>
          <Card
            type="inner"
            title="Related Routines"
            style={{ marginTop: '16px' }}
          >
            <RelatedRoutines groupAction={this.props.group} />
          </Card>
        </Space>
      );
    }
    return <Empty description="No special actions for group" />;
  }

  private async lightCommand(command: string): Promise<void> {
    await sendRequest({
      method: 'put',
      url: `/group/${this.props.group._id}/command/${command}`,
    });
  }

  private async removeEntity(entity_id: string): Promise<void> {
    const group = await sendRequest<GroupDTO>({
      body: {
        entities: this.props.group.entities.filter(i => i !== entity_id),
      } as Partial<GroupDTO>,
      method: 'put',
      url: `/group/${this.props.group._id}`,
    });
    this.props.onUpdate(group);
  }

  private async rename(friendlyName: string) {
    this.props.onUpdate(
      await sendRequest({
        body: { friendlyName },
        method: 'put',
        url: `/group/${this.props.group._id}`,
      }),
    );
  }

  private renderContents() {
    return this.props.group ? (
      <>
        <Typography.Title
          level={3}
          editable={{ onChange: async name => await this.rename(name) }}
        >
          {this.props.group.friendlyName}
        </Typography.Title>
        <Tabs type="card">
          <Tabs.TabPane key="members" tab="Members">
            <Card
              type="inner"
              key="entities"
              extra={
                <EntityModalPicker
                  exclude={this.props.group.entities}
                  domains={this.domainList()}
                  onAdd={this.addEntities.bind(this)}
                />
              }
            >
              <List
                dataSource={this.props.group.entities ?? []}
                renderItem={entity_id => (
                  <List.Item>
                    <List.Item.Meta
                      title={<EntityInspectButton entity_id={entity_id} />}
                    />
                    <Popconfirm
                      title={`Are you sure you want to remove ${entity_id}?`}
                      onConfirm={() => this.removeEntity(entity_id)}
                    >
                      <Button danger type="text">
                        X
                      </Button>
                    </Popconfirm>
                  </List.Item>
                )}
              />
            </Card>
          </Tabs.TabPane>
          <Tabs.TabPane key="save_states" tab="Save States">
            <GroupSaveStates
              group={this.props.group}
              onGroupUpdate={this.props.onUpdate.bind(this)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="actions" tab="Actions">
            {this.groupActions()}
          </Tabs.TabPane>
          <Tabs.TabPane key="used_in" tab="Used In">
            <GroupUsedIn group={this.props.group} />
          </Tabs.TabPane>
        </Tabs>
      </>
    ) : (
      <Empty description="Pick a group" />
    );
  }
}
