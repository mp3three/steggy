import {
  CameraOutlined,
  FolderAddOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { GroupDTO, GroupSaveStateDTO } from '@steggy/controller-shared';
import { DOWN, sleep, UP } from '@steggy/utilities';
import {
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  List,
  notification,
  Popconfirm,
  Space,
} from 'antd';

import { FD_ICONS, sendRequest } from '../../types';
import { RelatedRoutines } from '../routines';
import { GroupStateEdit } from './states';

export function GroupSaveStates(props: {
  group: GroupDTO;
  onGroupUpdate: (group?: GroupDTO) => void;
}) {
  let captureForm: FormInstance;
  let createForm: FormInstance;

  async function activateState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/group/${props.group._id}/state/${state.id}`,
    });
    await sleep(500);
    props.onGroupUpdate();
  }

  async function removeState(state: GroupSaveStateDTO): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${props.group._id}/state/${state.id}`,
    });
    await sleep(500);
    props.onGroupUpdate();
  }

  async function validateCapture(): Promise<void> {
    try {
      const values = await captureForm.validateFields();
      const group = await sendRequest<GroupDTO>({
        body: values,
        method: 'post',
        url: `/group/${props.group._id}/capture`,
      });
      notification.success({
        message: `State captured: ${values.friendlyName}`,
      });
      props.onGroupUpdate(group);
      captureForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  }

  async function validateCreate(): Promise<void> {
    try {
      const values = await createForm.validateFields();
      const group = await sendRequest<GroupDTO>({
        body: values,
        method: 'post',
        url: `/group/${props.group._id}/state`,
      });
      props.onGroupUpdate(group);
      createForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        type="inner"
        title="Save States"
        key="states"
        extra={
          <Space>
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
              onConfirm={() => validateCapture()}
              title={
                <Form
                  onFinish={() => validateCapture()}
                  ref={form => (captureForm = form)}
                >
                  <Form.Item
                    label="Friendly Name"
                    name="friendlyName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Form>
              }
            >
              <Button size="small" icon={<CameraOutlined />}>
                Capture current
              </Button>
            </Popconfirm>
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
              onConfirm={() => validateCreate()}
              title={
                <Form
                  onFinish={() => validateCreate()}
                  ref={form => (createForm = form)}
                >
                  <Form.Item
                    label="Friendly Name"
                    name="friendlyName"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Form>
              }
            >
              <Button size="small" icon={<FolderAddOutlined />}>
                Create new
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <List
          dataSource={(props.group?.save_states ?? []).sort((a, b) =>
            a.friendlyName > b.friendlyName ? UP : DOWN,
          )}
          renderItem={record => (
            <List.Item>
              <List.Item.Meta
                title={
                  <GroupStateEdit
                    onUpdate={group => props.onGroupUpdate(group)}
                    group={props.group}
                    state={record}
                  />
                }
              />
              <Button
                onClick={() => activateState(record)}
                type="primary"
                icon={FD_ICONS.get('execute')}
              >
                Activate
              </Button>
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title={`Are you sure you want to delete ${record.friendlyName}`}
                onConfirm={() => removeState(record)}
              >
                <Button danger type="text">
                  X
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
      <Card type="inner" title="Used In">
        <RelatedRoutines groupState={props.group} />
      </Card>
    </Space>
  );
}
