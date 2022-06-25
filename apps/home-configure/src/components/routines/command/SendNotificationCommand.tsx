import { RoutineCommandSendNotificationDTO } from '@steggy/controller-shared';
import { Form, Input, Select, Typography } from 'antd';

export function SendNotificationCommand(props: {
  command?: RoutineCommandSendNotificationDTO;
  onUpdate: (command: Partial<RoutineCommandSendNotificationDTO>) => void;
}) {
  // ???
  // public load(command: Partial<RoutineCommandSendNotificationDTO> = {}): void {
  //   this.setState({ template: command.template });
  // }

  const type = props.command?.type ?? 'simple';
  return (
    <>
      <Form.Item label="Value">
        <Input.TextArea
          defaultValue={props.command?.template}
          onBlur={({ target }) => props.onUpdate({ template: target.value })}
        />
      </Form.Item>
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
          <Typography.Text type="secondary">
            Send message as is.
          </Typography.Text>
        ) : undefined}
        {type === 'template' ? (
          <Typography.Text type="secondary">
            Process as template in Home Assistant, then send.
          </Typography.Text>
        ) : undefined}
        {type === 'javascript' ? (
          <Typography.Text type="secondary">
            Process message as javascript. Result is sent as notification.
          </Typography.Text>
        ) : undefined}
      </Form.Item>
    </>
  );
}
