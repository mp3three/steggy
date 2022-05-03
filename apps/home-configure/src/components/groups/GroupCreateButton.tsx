import { QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO } from '@steggy/controller-shared';
import { Button, Form, FormInstance, Input, Popconfirm } from 'antd';

import { FD_ICONS, sendRequest } from '../../types';

export function GroupCreateButton(props: {
  highlight: boolean;
  onUpdate: (group: GroupDTO) => void;
  type: string;
}) {
  let form: FormInstance;

  async function validate(): Promise<void> {
    try {
      const values = await form.validateFields();
      values.type = props.type;
      const group = await sendRequest<GroupDTO>({
        body: values,
        method: 'post',
        url: `/group`,
      });
      form.resetFields();
      props.onUpdate(group);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Popconfirm
      icon={<QuestionCircleOutlined style={{ visibility: 'hidden' }} />}
      onConfirm={() => validate()}
      placement="bottomRight"
      title={
        <Form onFinish={() => validate()} ref={ref => (form = ref)}>
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
      <Button
        icon={FD_ICONS.get('plus_box')}
        type={!props.highlight ? 'text' : 'primary'}
        size="small"
      >
        Create new
      </Button>
    </Popconfirm>
  );
}
