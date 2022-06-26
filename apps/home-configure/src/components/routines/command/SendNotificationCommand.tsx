import { RoutineCommandSendNotificationDTO } from '@steggy/controller-shared';
import { Form, Input, Select, Typography } from 'antd';

import { TypedEditor } from '../../misc';

export function SendNotificationCommand(props: {
  command?: RoutineCommandSendNotificationDTO;
  onUpdate: (command: Partial<RoutineCommandSendNotificationDTO>) => void;
}) {
  const type = props.command?.type ?? 'simple';
  return (
    <>
      <Form.Item label="Type">
        <Select value={type} onChange={type => props.onUpdate({ type })}>
          <Select.Option value="simple">Plain Text</Select.Option>
          <Select.Option value="template">
            Home Assistant Template
          </Select.Option>
          <Select.Option value="javascript">TS Eval</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label=" " colon={false}>
        {type === 'simple' ? (
          <Typography.Text type="secondary">Send message as is</Typography.Text>
        ) : undefined}
        {type === 'template' ? (
          <Typography.Text type="secondary">
            Process as template in Home Assistant, then send
          </Typography.Text>
        ) : undefined}
        {type === 'javascript' ? (
          <Typography.Text type="secondary">
            Return result is sent as notification
          </Typography.Text>
        ) : undefined}
      </Form.Item>
      <Form.Item>
        {type === 'javascript' ? (
          <TypedEditor
            code={props.command.template}
            onUpdate={template => props.onUpdate({ template })}
          />
        ) : (
          <Input.TextArea
            defaultValue={props.command?.template}
            style={{ minHeight: '15vh' }}
            onBlur={({ target }) => props.onUpdate({ template: target.value })}
          />
        )}
      </Form.Item>
    </>
  );
}
