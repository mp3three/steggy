import type { GROUP_TYPES, GroupDTO } from '@steggy/controller-shared';
import {
  DOWN,
  is,
  LABEL,
  NOT_FOUND,
  TitleCase,
  UP,
  VALUE,
} from '@steggy/utilities';
import {
  Button,
  Card,
  Col,
  Form,
  Layout,
  List,
  Row,
  Select,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { GROUP_DESCRIPTIONS, sendRequest } from '../../types';
import { GroupCreateButton } from './GroupCreateButton';
import { GroupListDetail } from './GroupListDetail';

const { Content } = Layout;

export function GroupPage() {
  const [group, setGroup] = useState<GroupDTO>();
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [groupType, setGroupType] = useState<`${GROUP_TYPES}` | 'all'>('all');

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (groupType === 'all') {
      return;
    }
    const count = groups.filter(({ type }) => type === groupType).length;
    if (!count) {
      setGroupType('all');
    }
  }, [groupType, groups]);

  const countMap = new Map<string, number>();
  groups.forEach(({ type }) =>
    countMap.set(type, (countMap.get(type) ?? 0) + 1),
  );

  function filter(type: string): GroupDTO[] {
    if (type === 'all') {
      return groups;
    }
    return groups.filter(group => group.type === type);
  }

  function onClone(group: GroupDTO): void {
    setGroup(group);
    setGroups(
      [...groups, group].sort((a, b) =>
        a.friendlyName > b.friendlyName ? UP : DOWN,
      ),
    );
  }

  async function refresh(target?: GroupDTO): Promise<void> {
    if (target) {
      const index = groups.findIndex(({ _id }) => _id === target._id);
      setGroup(target);
      if (index === NOT_FOUND) {
        setGroups(
          [...groups, target].sort((a, b) =>
            a.friendlyName > b.friendlyName ? UP : DOWN,
          ),
        );
        return;
      }
      setGroups(
        groups
          .map(item => (item._id === target._id ? target : item))
          .sort((a, b) => (a.friendlyName > b.friendlyName ? UP : DOWN)),
      );
      return;
    }
    setGroup(undefined);
    setGroups(
      await sendRequest<GroupDTO[]>({
        control: {
          select: ['type', 'friendlyName'],
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
              size="small"
              type={
                group?._id === target._id
                  ? 'primary'
                  : !is.empty(target.friendlyName)
                  ? 'text'
                  : 'dashed'
              }
              onClick={() => updateGroup(target)}
            >
              {target.friendlyName || (
                <Typography.Text type="danger" strong>
                  No Name
                </Typography.Text>
              )}
            </Button>
          }
        />
        {groupType === 'all' ? (
          <Button
            type="text"
            size="small"
            onClick={() => setGroupType(target.type)}
          >
            <Typography.Text type="secondary">
              {TitleCase(target?.type)} Group
            </Typography.Text>
          </Button>
        ) : undefined}
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
    setGroupType(type);
    setGroup(undefined);
  }
  const filtered = filter(groupType);

  return (
    <Layout>
      <Content style={{ padding: '16px' }}>
        <Row gutter={8}>
          <Col span={12}>
            <Card
              type="inner"
              title={
                <Form.Item
                  label={<Typography.Text strong>Type</Typography.Text>}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    size="small"
                    style={{ width: '60%' }}
                    value={groupType}
                    onChange={value => tabChange(value as GROUP_TYPES)}
                  >
                    <Select.Option value="all">
                      <Typography.Text type="secondary">
                        ({groups.length}) Show All
                      </Typography.Text>
                    </Select.Option>
                    {[...countMap.entries()]
                      .sort((a, b) => {
                        // Sort groups with highest counts to top
                        // Then alphabetically
                        if (a[VALUE] < b[VALUE]) {
                          return UP;
                        }
                        if (a[VALUE] > b[VALUE]) {
                          return DOWN;
                        }
                        return a[LABEL] > b[LABEL] ? UP : DOWN;
                      })
                      .map(([type, count]) => (
                        <Select.Option key={type} value={type}>
                          <Typography>
                            <Typography.Text type="secondary">{`(${count}) `}</Typography.Text>
                            {TitleCase(type ?? 'UNKNOWN')}
                          </Typography>
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              }
              extra={
                <GroupCreateButton
                  onCreateType={type => setGroupType(type)}
                  highlight={is.empty(filtered)}
                  onUpdate={group => refresh(group)}
                />
              }
            >
              <List
                dataSource={filtered}
                pagination={{ size: 'small' }}
                renderItem={item => renderGroup(item)}
              ></List>
            </Card>
          </Col>
          <Col span={12}>
            <GroupListDetail
              description={GROUP_DESCRIPTIONS.get(groupType as GROUP_TYPES)}
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
