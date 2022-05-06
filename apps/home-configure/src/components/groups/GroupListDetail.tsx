import { GroupDTO, GroupReferenceDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Col,
  Empty,
  List,
  Popconfirm,
  Row,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';

import { sendRequest } from '../../types';
import { EntityInspectButton, EntityModalPicker } from '../entities';
import { PersonInspectButton, PersonModalPicker } from '../people';
import { RoomInspectButton, RoomModalPicker } from '../rooms';
import { RelatedRoutines } from '../routines';
import { GroupExtraActions } from './GroupExtraActions';
import { GroupModalPicker } from './GroupModalPicker';
import { GroupSaveStates } from './GroupSaveState';
import { GroupUsedIn } from './GroupUsedIn';
import { GroupInspectButton } from './InspectButton';

// eslint-disable-next-line radar/cognitive-complexity
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

  async function addReference(
    type: string,
    references: string[],
  ): Promise<void> {
    const { group } = props;
    props.onUpdate(
      await sendRequest({
        body: { references, type },
        method: 'post',
        url: `/group/${group._id}/reference`,
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

  const HAS_ACTIONS = ['light'].includes(props.group?.type);

  function groupActions() {
    if (props.group.type === 'light') {
      return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            type="inner"
            title={
              <Typography.Text strong>Light Group Actions</Typography.Text>
            }
          >
            <Row gutter={[8, 8]}>
              <Col span={8}>
                <Tooltip title="Turn on, and manage light temperature">
                  <Button
                    type="primary"
                    onClick={() => lightCommand('circadianOn')}
                  >
                    Circadian
                  </Button>
                </Tooltip>
              </Col>
              <Col span={8}>
                <Tooltip title="Turn on, and set to color">
                  <Button type="primary" onClick={() => lightCommand('turnOn')}>
                    On
                  </Button>
                </Tooltip>
              </Col>
              <Col span={8}>
                <Button type="primary" onClick={() => lightCommand('turnOff')}>
                  Off
                </Button>
              </Col>
              <Col>
                <Space>
                  {/* The button is a lie, but the feature is real! */}
                  {/* Might add a slider in here later to let the button be real */}
                  <Button type="primary" disabled>
                    Dim Up / Down
                  </Button>
                  <Typography.Text type="secondary">
                    Available as routine group actions
                  </Typography.Text>
                </Space>
              </Col>
            </Row>
          </Card>
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

  async function removeReference(target: string): Promise<void> {
    const group = await sendRequest<GroupDTO>({
      method: 'delete',
      url: `/group/${props.group._id}/reference/${target}`,
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

  function entityRef() {
    return (
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
    );
  }

  function groupReferences(groups: GroupReferenceDTO[]) {
    return (
      <Card
        type="inner"
        key="entities"
        extra={
          <GroupModalPicker
            exclude={groups.map(({ target }) => target)}
            onAdd={selected => addReference('group', selected)}
            highlight={is.empty(groups)}
          />
        }
      >
        <List
          dataSource={groups}
          renderItem={({ target }) => (
            <List.Item>
              <List.Item.Meta title={<GroupInspectButton group={target} />} />
              <Popconfirm
                title={`Are you sure you want to remove this group?`}
                onConfirm={() => removeReference(target)}
              >
                <Button danger type="text">
                  X
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
    );
  }

  function peopleReferences(people: GroupReferenceDTO[]) {
    return (
      <Card
        type="inner"
        key="entities"
        extra={
          <PersonModalPicker
            exclude={people.map(({ target }) => target)}
            onAdd={selected => addReference('person', selected)}
            highlight={is.empty(people)}
          />
        }
      >
        <List
          dataSource={people}
          renderItem={({ target }) => (
            <List.Item>
              <List.Item.Meta title={<PersonInspectButton person={target} />} />
              <Popconfirm
                title={`Are you sure you want to remove this person?`}
                onConfirm={() => removeReference(target)}
              >
                <Button danger type="text">
                  X
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
    );
  }

  function roomReferences(rooms: GroupReferenceDTO[]) {
    return (
      <Card
        type="inner"
        key="entities"
        extra={
          <RoomModalPicker
            exclude={rooms.map(({ target }) => target)}
            onAdd={selected => addReference('room', selected)}
            highlight={is.empty(rooms)}
          />
        }
      >
        <List
          dataSource={rooms}
          renderItem={({ target }) => (
            <List.Item>
              <List.Item.Meta title={<RoomInspectButton room={target} />} />
              <Popconfirm
                title={`Are you sure you want to remove this room?`}
                onConfirm={() => removeReference(target)}
              >
                <Button danger type="text">
                  X
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
    );
  }

  function memberEditor() {
    const references = props.group?.references ?? [];
    if (props.group.type === 'group') {
      return groupReferences(references.filter(({ type }) => type === 'group'));
    }
    if (props.group.type === 'room') {
      return roomReferences(references.filter(({ type }) => type === 'room'));
    }
    if (props.group.type === 'person') {
      return peopleReferences(
        references.filter(({ type }) => type === 'person'),
      );
    }
    return entityRef();
  }

  function renderContents() {
    const memberCount = [
      ...(props.group?.entities ?? []),
      ...(props.group?.references ?? []),
    ].length;
    return props.group ? (
      <>
        <Typography.Title
          level={3}
          editable={{ onChange: async name => await rename(name) }}
        >
          {props.group.friendlyName}
        </Typography.Title>
        <Tabs>
          <Tabs.TabPane
            key="members"
            tab={
              <Typography>
                <Typography.Text type="secondary">{`(${memberCount}) `}</Typography.Text>
                Members
              </Typography>
            }
          >
            {memberEditor()}
          </Tabs.TabPane>
          <Tabs.TabPane
            key="save_states"
            tab={
              <Typography>
                <Typography.Text type="secondary">{`(${props.group.save_states.length}) `}</Typography.Text>
                Save States
              </Typography>
            }
          >
            <GroupSaveStates
              group={props.group}
              onGroupUpdate={update => props.onUpdate(update)}
            />
          </Tabs.TabPane>
          {HAS_ACTIONS ? (
            <Tabs.TabPane key="actions" tab="Actions">
              {groupActions()}
            </Tabs.TabPane>
          ) : undefined}
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
