import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  GroupDTO,
  PersonDTO,
  RoomDTO,
  RoomEntityDTO,
} from '@steggy/controller-shared';
import { DOWN, TitleCase, UP } from '@steggy/utilities';
import { Button, Card, List, Popconfirm, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { EntityInspectButton } from '../entities/InspectButton';
import { GroupInspectButton, GroupModalPicker } from '../groups';
import { RoomInsectButton, RoomModalPicker } from '../rooms';

type PartialGroup = Pick<
  GroupDTO,
  '_id' | 'friendlyName' | 'type' | 'save_states'
>;
type tStateType = {
  group?: GroupDTO;
  groups: PartialGroup[];
  room?: RoomDTO;
  rooms: RoomDTO[];
};

export class PersonConfiguration extends React.Component<
  { onUpdate: (person: PersonDTO) => void; person: PersonDTO },
  tStateType
> {
  override state = { flags: [], groups: [], rooms: [] } as tStateType;

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
              exclude={this.props.person.entities.map(
                ({ entity_id }) => entity_id,
              )}
            />
          }
        >
          <List
            dataSource={(this.props.person.entities ?? []).sort((a, b) =>
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
              exclude={this.props.person.groups}
              onAdd={this.addGroups.bind(this)}
            />
          }
        >
          <List
            dataSource={this.props.person.groups}
            renderItem={item => this.groupRender(item)}
          />
        </Card>
        <Card
          type="inner"
          title="Rooms"
          extra={
            <RoomModalPicker
              exclude={this.props.person.rooms}
              onAdd={this.addRooms.bind(this)}
            />
          }
        >
          <List
            dataSource={this.props.person.rooms}
            renderItem={item => this.roomRender(item)}
          />
        </Card>
      </Space>
    );
  }

  private async addEntities(entities: string[]): Promise<void> {
    const person = this.props.person;
    person.entities = [
      ...person.entities,
      ...entities.map(entity_id => ({ entity_id })),
    ];
    this.props.onUpdate(
      await sendRequest<PersonDTO>({
        body: {
          entities: person.entities,
        } as Partial<PersonDTO>,
        method: 'put',
        url: `/person/${person._id}`,
      }),
    );
  }

  private async addGroups(groups: string[]): Promise<void> {
    const person = this.props.person;
    this.props.onUpdate(
      await sendRequest<PersonDTO>({
        body: { groups },
        method: 'post',
        url: `/person/${person._id}/group`,
      }),
    );
  }

  private async addRooms(rooms: string[]): Promise<void> {
    const person = this.props.person;
    this.props.onUpdate(
      await sendRequest<PersonDTO>({
        body: { rooms },
        method: 'post',
        url: `/person/${person._id}/room`,
      }),
    );
  }

  private async detachGroup(group: string): Promise<void> {
    let person = this.props.person;
    person = await sendRequest({
      body: { groups: person.groups.filter(i => i !== group) },
      method: 'put',
      url: `/person/${person._id}`,
    });
    this.props.onUpdate(person);
  }

  private async detachRoom(room: string): Promise<void> {
    let person = this.props.person;
    person = await sendRequest({
      body: { rooms: person.rooms.filter(i => i !== room) },
      method: 'put',
      url: `/person/${person._id}`,
    });
    this.props.onUpdate(person);
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
            <Button danger type="text" size="small">
              X
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta title={<EntityInspectButton entity_id={entity_id} />} />
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
          title={
            <GroupInspectButton
              group={group as GroupDTO}
              onUpdate={group => this.updateGroup(group)}
            />
          }
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
      rooms: await sendRequest({
        url: `/room`,
      }),
    });
  }

  private async removeEntity(entity: string): Promise<void> {
    this.props.onUpdate(
      await sendRequest<PersonDTO>({
        method: 'delete',
        url: `/person/${this.props.person._id}/entity/${entity}`,
      }),
    );
  }

  private room(id: string): RoomDTO {
    return this.state.rooms.find(({ _id }) => _id === id);
  }

  private roomRender(item: string) {
    const room = this.room(item);
    if (!room) {
      return undefined;
    }
    return (
      <List.Item
        key={item}
        actions={[
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title={`Detach room?`}
            onConfirm={() => this.detachRoom(item)}
          >
            <Button danger type="text">
              <CloseOutlined />
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta
          title={
            <RoomInsectButton
              room={room}
              onUpdate={room => this.updateRoom(room)}
            />
          }
        />
      </List.Item>
    );
  }

  private updateGroup(group: GroupDTO): void {
    if (!group) {
      this.setState({
        group: undefined,
        groups: this.state.groups.filter(
          ({ _id }) => _id !== this.state.group._id,
        ),
      });
      return;
    }
    this.setState({
      groups: this.state.groups.map(g => (g._id === group._id ? group : g)),
    });
  }

  private updateRoom(room: RoomDTO): void {
    if (!room) {
      this.setState({
        room: undefined,
        rooms: this.state.rooms.filter(
          ({ _id }) => _id !== this.state.group._id,
        ),
      });
      return;
    }
    this.setState({
      rooms: this.state.rooms.map(g => (g._id === room._id ? room : g)),
    });
  }
}
