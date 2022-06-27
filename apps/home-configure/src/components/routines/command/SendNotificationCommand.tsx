import { RoutineCommandSendNotificationDTO } from '@steggy/controller-shared';
import { Form, Input, Radio, Typography } from 'antd';

import { TypedEditor } from '../../misc';

export function SendNotificationCommand(props: {
  command?: RoutineCommandSendNotificationDTO;
  onUpdate: (command: Partial<RoutineCommandSendNotificationDTO>) => void;
}) {
  const type = props.command?.type ?? 'simple';
  return (
    <>
      <Form.Item label="Type">
        <Radio.Group
          buttonStyle="solid"
          value={type}
          onChange={({ target }) => props.onUpdate({ type: target.value })}
        >
          <Radio.Button value="simple">Plain Text</Radio.Button>
          <Radio.Button value="template">Home Assistant Template</Radio.Button>
          <Radio.Button value="eval">TS Eval</Radio.Button>
        </Radio.Group>
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
        {type === 'eval' ? (
          <Typography.Text type="secondary">
            Return result is sent as notification
          </Typography.Text>
        ) : undefined}
      </Form.Item>
      <Form.Item>
        {type === 'eval' ? (
          <TypedEditor
            code={props.command.template}
            secondaryText="Return text to send via notification"
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
