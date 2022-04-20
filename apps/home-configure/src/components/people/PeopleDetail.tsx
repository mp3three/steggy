import { QuestionCircleOutlined } from '@ant-design/icons';
import { PersonDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Form,
  Input,
  Menu,
  Popconfirm,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { RoomMetadata } from '../misc';
import { PersonConfiguration } from './PersonConfiguration';
// import { RoomSaveStates } from './RoomSaveState';

type tState = {
  name: string;
};

export class PeopleDetail extends React.Component<
  {
    nested?: boolean;
    onClone?: (person: PersonDTO) => void;
    onUpdate: (person?: PersonDTO) => void;
    person?: PersonDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    if (this.props.nested) {
      return this.renderBody();
    }
    return (
      <Card
        title="Person details"
        extra={
          !is.object(this.props.person) ? undefined : (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="delete">
                    <Popconfirm
                      icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                      title={`Are you sure you want to delete ${this.props.person.friendlyName}?`}
                      onConfirm={() => this.delete()}
                    >
                      <Button
                        style={{ textAlign: 'start', width: '100%' }}
                        danger
                        icon={FD_ICONS.get('remove')}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Menu.Item>
                  <Menu.Item key="clone">
                    <Button
                      onClick={() => this.clone()}
                      icon={FD_ICONS.get('clone')}
                      style={{ textAlign: 'start', width: '100%' }}
                    >
                      Clone
                    </Button>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="text" size="small">
                {FD_ICONS.get('menu')}
              </Button>
            </Dropdown>
          )
        }
      >
        {this.renderBody()}
      </Card>
    );
  }

  private async clone(): Promise<void> {
    const cloned = await sendRequest<PersonDTO>({
      method: 'post',
      url: `/person/${this.props.person._id}/clone`,
    });
    if (this.props.onClone) {
      this.props.onClone(cloned);
    }
  }

  private async delete(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/person/${this.props.person._id}`,
    });
    this.props.onUpdate();
  }

  private renderBody() {
    return !this.props.person ? (
      <Empty description="Select a person" />
    ) : (
      <>
        <Typography.Title
          level={3}
          editable={{
            onChange: friendlyName => this.update({ friendlyName }),
          }}
        >
          {this.props.person.friendlyName}
        </Typography.Title>
        <Tabs>
          <Tabs.TabPane key="members" tab="Members">
            <PersonConfiguration
              person={this.props.person}
              onUpdate={person => this.props.onUpdate(person)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="save_states" tab="Save States">
            {/* <RoomSaveStates
              room={this.props.room}
              onUpdate={room => this.props.onUpdate(room)}
            /> */}
          </Tabs.TabPane>
          <Tabs.TabPane key="metadata" tab="Metadata">
            <RoomMetadata
              room={this.props.person}
              onUpdate={person => this.props.onUpdate(person)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="settings" tab="Settings">
            <Card>
              <Form.Item label="Internal Name">
                <Input
                  defaultValue={
                    this.props.person.name ?? `person_${this.props.person._id}`
                  }
                  onBlur={({ target }) => this.update({ name: target.value })}
                />
              </Form.Item>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }

  private async update(body: Partial<PersonDTO>): Promise<void> {
    const room = await sendRequest<PersonDTO>({
      body,
      method: 'put',
      url: `/person/${this.props.person._id}`,
    });
    this.props.onUpdate(room);
  }
}
