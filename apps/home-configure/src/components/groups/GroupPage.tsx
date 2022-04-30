import type { GROUP_TYPES, GroupDTO } from '@steggy/controller-shared';
import { NOT_FOUND } from '@steggy/utilities';
import { Button, Card, Col, Layout, List, Row, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';

import { GROUP_DESCRIPTIONS, sendRequest } from '../../types';
import { GroupCreateButton } from './GroupCreateButton';
import { GroupListDetail } from './GroupListDetail';

const { Content } = Layout;

let lastTab: `${GROUP_TYPES}` = 'light';

export function GroupPage() {
  const [group, setGroup] = useState<GroupDTO>();
  const [groups, setGroups] = useState<GroupDTO[]>([]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function filter(type: string): GroupDTO[] {
    return groups.filter(group => group.type === type);
  }

  function onClone(group: GroupDTO): void {
    setGroup(group);
    setGroups([...groups, group]);
  }

  async function refresh(target?: GroupDTO): Promise<void> {
    if (target) {
      const index = groups.findIndex(({ _id }) => _id === target._id);
      setGroup(target);
      if (index === NOT_FOUND) {
        setGroups([...groups, target]);
        return;
      }
      setGroups(groups.map(item => (item._id === target._id ? target : item)));
      return;
    }
    setGroup(undefined);
    setGroups(
      await sendRequest<GroupDTO[]>({
        control: {
          sort: ['friendlyName'],
        },
        url: `/group`,
      }),
    );
  }

  function renderGroup(target: GroupDTO) {
    return (
      <List.Item key={target._id}>
        <List.Item.Meta
          title={
            <Button
              type={group?._id === target._id ? 'primary' : 'text'}
              onClick={() => updateGroup(target)}
            >
              {target.friendlyName}
            </Button>
          }
        />
      </List.Item>
    );
  }

  async function updateGroup(group: GroupDTO): Promise<void> {
    setGroup(
      await sendRequest({
        url: `/group/${group._id}`,
      }),
    );
  }

  function tabChange(type: GROUP_TYPES): void {
    if (lastTab === type) {
      return;
    }
    lastTab = type;
    setGroup(undefined);
  }

  return (
    <Layout>
      <Content style={{ padding: '16px' }}>
        <Row gutter={8}>
          <Col span={12}>
            <Tabs type="card" onTabClick={tab => tabChange(tab as GROUP_TYPES)}>
              <Tabs.TabPane
                key="light"
                tab={`Light Groups (${filter('light').length})`}
              >
                <Card
                  type="inner"
                  extra={
                    <GroupCreateButton
                      type="light"
                      onUpdate={group => refresh(group)}
                    />
                  }
                >
                  <List
                    dataSource={filter('light')}
                    pagination={{ size: 'small' }}
                    renderItem={item => renderGroup(item)}
                  ></List>
                </Card>
              </Tabs.TabPane>
              <Tabs.TabPane
                key="switch"
                tab={`Switch Groups (${filter('switch').length})`}
              >
                <Card
                  type="inner"
                  extra={
                    <GroupCreateButton
                      type="switch"
                      onUpdate={group => refresh(group)}
                    />
                  }
                >
                  <List
                    dataSource={filter('switch')}
                    pagination={{ size: 'small' }}
                    renderItem={item => renderGroup(item)}
                  ></List>
                </Card>
              </Tabs.TabPane>
              <Tabs.TabPane
                key="fan"
                tab={`Fan Groups (${filter('fan').length})`}
              >
                <Card
                  type="inner"
                  extra={
                    <GroupCreateButton
                      type="fan"
                      onUpdate={group => refresh(group)}
                    />
                  }
                >
                  <List
                    dataSource={filter('fan')}
                    pagination={{ size: 'small' }}
                    renderItem={item => renderGroup(item)}
                  ></List>
                </Card>
              </Tabs.TabPane>
              <Tabs.TabPane
                key="lock"
                tab={`Lock Groups (${filter('lock').length})`}
              >
                <Card
                  type="inner"
                  extra={
                    <GroupCreateButton
                      type="lock"
                      onUpdate={group => refresh(group)}
                    />
                  }
                >
                  <List
                    dataSource={filter('lock')}
                    pagination={{ size: 'small' }}
                    renderItem={item => renderGroup(item)}
                  ></List>
                </Card>
              </Tabs.TabPane>
            </Tabs>
          </Col>
          <Col span={12}>
            <GroupListDetail
              description={GROUP_DESCRIPTIONS.get(lastTab)}
              group={group}
              onClone={group => onClone(group)}
              onUpdate={group => refresh(group)}
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
