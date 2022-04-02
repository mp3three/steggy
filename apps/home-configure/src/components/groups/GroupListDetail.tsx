import { GroupDTO } from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import { Button, Card, Empty, Space, Tabs, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { RelatedRoutines } from '../routines';
import { FanGroup } from './FanGroup';
import { GroupSaveStates } from './GroupSaveState';
import { LightGroup } from './LightGroup';
import { LockGroup } from './LockGroup';
import { SwitchGroup } from './SwitchGroup';

type tState = {
  name: string;
};

export class GroupListDetail extends React.Component<
  { group: GroupDTO; onUpdate: (group: GroupDTO) => void },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Card type="inner" title="Group Settings">
        {this.props.group ? (
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
                  {this.groupRendering()}
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
            </Tabs>
          </>
        ) : (
          <Empty description="Pick a group" />
        )}
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

  private groupRendering() {
    if (this.props.group.type === 'light') {
      return (
        <LightGroup
          group={this.props.group}
          groupUpdate={this.props.onUpdate.bind(this)}
        />
      );
    }
    if (this.props.group.type === 'fan') {
      return (
        <FanGroup
          group={this.props.group}
          groupUpdate={this.props.onUpdate.bind(this)}
        />
      );
    }
    if (this.props.group.type === 'lock') {
      return (
        <LockGroup
          group={this.props.group}
          groupUpdate={this.props.onUpdate.bind(this)}
        />
      );
    }
    return (
      <SwitchGroup
        group={this.props.group}
        groupUpdate={this.props.onUpdate.bind(this)}
      />
    );
  }

  private async lightCommand(command: string): Promise<void> {
    await sendRequest({
      method: 'put',
      url: `/group/${this.props.group._id}/command/${command}`,
    });
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
}
