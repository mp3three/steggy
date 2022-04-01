import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
} from '@automagical/controller-shared';
import { DOWN, TitleCase, UP } from '@automagical/utilities';
import { Button, Card, List, Popconfirm, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { GroupModalPicker } from '../groups';

type PartialGroup = Pick<
  GroupDTO,
  '_id' | 'friendlyName' | 'type' | 'save_states'
>;
type tStateType = {
  groups: PartialGroup[];
};

export class RoomConfiguration extends React.Component<
  { onUpdate: (room: RoomDTO) => void; room: RoomDTO },
  tStateType
> {
  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card
          type="inner"
          title="Entities"
          extra={
            <EntityModalPicker
              onAdd={this.addEntities.bind(this)}
              exclude={this.props.room.entities.map(
                ({ entity_id }) => entity_id,
              )}
            />
          }
        >
          <List
            dataSource={(this.props.room.entities ?? []).sort((a, b) =>
              a > b ? UP : DOWN,
            )}
            renderItem={item => this.entityRender(item)}
          />
        </Card>
        <Card
          type="inner"
          title="Groups"
          extra={
            <GroupModalPicker
              exclude={this.props.room.groups}
              onAdd={this.addGroups.bind(this)}
            />
          }
        >
          <List
            dataSource={this.props.room.groups}
            renderItem={item => this.groupRender(item)}
          />
        </Card>
      </Space>
    );
  }

  private async addEntities(entities: string[]): Promise<void> {
    const room = this.props.room;
    room.entities = [
      ...room.entities,
      ...entities.map(entity_id => ({ entity_id })),
    ];
    this.props.onUpdate(
      await sendRequest<RoomDTO>({
        body: {
          entities: room.entities,
        } as Partial<RoomDTO>,
        method: 'put',
        url: `/room/${room._id}`,
      }),
    );
  }

  private async addGroups(groups: string[]): Promise<void> {
    const room = this.props.room;
    this.props.onUpdate(
      await sendRequest<RoomDTO>({
        body: { groups },
        method: 'post',
        url: `/room/${room._id}/group`,
      }),
    );
  }

  private async detachGroup(group: string): Promise<void> {
    let room = this.props.room;
    room = await sendRequest({
      body: { groups: room.groups.filter(i => i !== group) },
      method: 'put',
      url: `/room/${room._id}`,
    });
    this.props.onUpdate(room);
  }

  private entityRender({ entity_id }: RoomEntityDTO) {
    return (
      <List.Item
        actions={[
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title="Are you sure you want to delete this?"
            onConfirm={() => this.removeEntity(entity_id)}
          >
            <Button danger type="text">
              X
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta title={entity_id} />
      </List.Item>
    );
  }

  private group(id: string): PartialGroup {
    return this.state?.groups.find(({ _id }) => _id === id);
  }

  private groupRender(item: string) {
    const group = this.group(item);
    if (!group) {
      return undefined;
    }
    return (
      <List.Item
        key={item}
        actions={[
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title={`Detach group?`}
            onConfirm={() => this.detachGroup(item)}
          >
            <Button danger type="text">
              <CloseOutlined />
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta
          title={<Link to={`/group/${item}`}>{group.friendlyName}</Link>}
          description={`${TitleCase(group.type)} group`}
        />
      </List.Item>
    );
  }

  private async refresh(): Promise<void> {
    this.setState({
      groups: await sendRequest({
        control: {
          select: [
            'friendlyName',
            'type',
            'save_states.friendlyName',
            'save_states.id',
          ],
        },
        url: `/group`,
      }),
    });
  }

  private async removeEntity(entity: string): Promise<void> {
    this.props.onUpdate(
      await sendRequest<RoomDTO>({
        method: 'delete',
        url: `/room/${this.props.room._id}/entity/${entity}`,
      }),
    );
  }
}
