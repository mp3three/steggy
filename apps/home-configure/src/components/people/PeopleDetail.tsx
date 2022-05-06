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

import { FD_ICONS, sendRequest } from '../../types';
import { ItemPin, RoomMetadata } from '../misc';
import { SaveStateEditor } from '../misc/SaveStateEditor';
import { PersonConfiguration } from './PersonConfiguration';

export function PeopleDetail(props: {
  nested?: boolean;
  onClone?: (person: PersonDTO) => void;
  onUpdate: (person?: PersonDTO) => void;
  person?: PersonDTO;
}) {
  async function clone(): Promise<void> {
    const cloned = await sendRequest<PersonDTO>({
      method: 'post',
      url: `/person/${props.person._id}/clone`,
    });
    if (props.onClone) {
      props.onClone(cloned);
    }
  }

  async function remove(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/person/${props.person._id}`,
    });
    props.onUpdate();
  }

  function renderBody() {
    const members = [
      ...(props.person?.rooms ?? []),
      ...(props.person?.groups ?? []),
      ...(props.person?.entities ?? []),
    ].length;
    return !props.person ? (
      <Empty description="Select a person" />
    ) : (
      <>
        <Typography.Title
          level={3}
          editable={{
            onChange: friendlyName => update({ friendlyName }),
          }}
        >
          {props.person.friendlyName}
        </Typography.Title>
        <Tabs>
          <Tabs.TabPane
            key="members"
            tab={
              <>
                <Typography.Text type="secondary">({members}) </Typography.Text>
                Members
              </>
            }
          >
            <PersonConfiguration
              person={props.person}
              onUpdate={person => props.onUpdate(person)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            key="save_states"
            tab={
              <>
                <Typography.Text type="secondary">
                  ({props.person?.save_states?.length ?? 0})
                </Typography.Text>
                {' Save States'}
              </>
            }
          >
            <SaveStateEditor
              person={props.person}
              onUpdate={room => props.onUpdate(room)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            key="metadata"
            tab={
              <>
                <Typography.Text type="secondary">
                  ({props.person?.metadata?.length ?? 0})
                </Typography.Text>
                {' Metadata'}
              </>
            }
          >
            <RoomMetadata
              person={props.person}
              onUpdate={person => props.onUpdate(person)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="settings" tab="Settings">
            <Card>
              <Form.Item label="Internal Name">
                <Input
                  defaultValue={
                    props.person.name ?? `person_${props.person._id}`
                  }
                  onBlur={({ target }) => update({ name: target.value })}
                />
              </Form.Item>
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }

  async function update(body: Partial<PersonDTO>): Promise<void> {
    const room = await sendRequest<PersonDTO>({
      body,
      method: 'put',
      url: `/person/${props.person._id}`,
    });
    props.onUpdate(room);
  }

  if (props.nested) {
    return renderBody();
  }
  return (
    <Card
      title={<Typography.Text strong>Person details</Typography.Text>}
      extra={
        !is.object(props.person) ? undefined : (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="delete">
                  <Popconfirm
                    icon={FD_ICONS.get('delete')}
                    title={`Are you sure you want to delete ${props.person.friendlyName}?`}
                    onConfirm={() => remove()}
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
                    onClick={() => clone()}
                    icon={FD_ICONS.get('clone')}
                    style={{ textAlign: 'start', width: '100%' }}
                  >
                    Clone
                  </Button>
                </Menu.Item>
                <ItemPin type="person" target={props.person._id} menuItem />
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
      {renderBody()}
    </Card>
  );
}
