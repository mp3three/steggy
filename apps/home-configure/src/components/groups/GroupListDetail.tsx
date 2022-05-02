import { GroupDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Empty,
  List,
  Popconfirm,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityInspectButton, EntityModalPicker } from '../entities';
import { RelatedRoutines } from '../routines';
import { GroupExtraActions } from './GroupExtraActions';
import { GroupSaveStates } from './GroupSaveState';
import { GroupUsedIn } from './GroupUsedIn';

export function GroupListDetail(props: {
  description?: React.ReactElement;
  group: GroupDTO;
  onClone?: (group: GroupDTO) => void;
  onUpdate: (group?: GroupDTO) => void;
  type?: 'inner';
}) {
  async function addEntities(entities: string[]): Promise<void> {
    const { group } = props;
    group.entities = is.unique([...group.entities, ...entities]);
    props.onUpdate(
      await sendRequest({
        body: {
          entities: group.entities,
        } as Partial<GroupDTO>,
        method: 'put',
        url: `/group/${group._id}`,
      }),
    );
  }

  function domainList(): string[] {
    const { group } = props;
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

  function groupActions() {
    if (props.group.type === 'light') {
      return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="large">
            <Button type="primary" onClick={() => lightCommand('circadianOn')}>
              Circadian
            </Button>
            <Button type="primary" onClick={() => lightCommand('turnOff')}>
              Off
            </Button>
            <Button type="primary" onClick={() => lightCommand('turnOn')}>
              On
            </Button>
          </Space>
          <Card
            type="inner"
            title={<Typography.Text strong>Related Routines</Typography.Text>}
            style={{ marginTop: '16px' }}
          >
            <RelatedRoutines groupAction={props.group} />
          </Card>
        </Space>
      );
    }
    return <Empty description="No special actions for group" />;
  }

  async function lightCommand(command: string): Promise<void> {
    await sendRequest({
      method: 'put',
      url: `/group/${props.group._id}/command/${command}`,
    });
  }

  async function removeEntity(entity_id: string): Promise<void> {
    const group = await sendRequest<GroupDTO>({
      body: {
        entities: props.group.entities.filter(i => i !== entity_id),
      } as Partial<GroupDTO>,
      method: 'put',
      url: `/group/${props.group._id}`,
    });
    props.onUpdate(group);
  }

  async function rename(friendlyName: string) {
    props.onUpdate(
      await sendRequest({
        body: { friendlyName },
        method: 'put',
        url: `/group/${props.group._id}`,
      }),
    );
  }

  function renderContents() {
    return props.group ? (
      <>
        <Typography.Title
          level={3}
          editable={{ onChange: async name => await rename(name) }}
        >
          {props.group.friendlyName}
        </Typography.Title>
        <Tabs>
          <Tabs.TabPane key="members" tab="Members">
            <Card
              type="inner"
              key="entities"
              extra={
                <EntityModalPicker
                  exclude={props.group.entities}
                  highlight={is.empty(props.group.entities)}
                  domains={domainList()}
                  onAdd={entities => addEntities(entities)}
                />
              }
            >
              <List
                pagination={{ size: 'small' }}
                dataSource={props.group.entities ?? []}
                renderItem={entity_id => (
                  <List.Item>
                    <List.Item.Meta
                      title={<EntityInspectButton entity_id={entity_id} />}
                    />
                    <Popconfirm
                      title={`Are you sure you want to remove ${entity_id}?`}
                      onConfirm={() => removeEntity(entity_id)}
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
              group={props.group}
              onGroupUpdate={update => props.onUpdate(update)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="actions" tab="Actions">
            {groupActions()}
          </Tabs.TabPane>
          <Tabs.TabPane key="used_in" tab="Used In">
            <GroupUsedIn group={props.group} />
          </Tabs.TabPane>
        </Tabs>
      </>
    ) : (
      <Empty description={props.description ?? 'Select a group'} />
    );
  }

  if (props.type === 'inner') {
    return renderContents();
  }
  return (
    <Card
      title={<Typography.Text strong>Group details</Typography.Text>}
      extra={
        !is.object(props.group) ? undefined : (
          <GroupExtraActions
            group={props.group}
            onClone={group => props.onClone(group)}
            onUpdate={group => props.onUpdate(group)}
          />
        )
      }
    >
      {renderContents()}
    </Card>
  );
}
