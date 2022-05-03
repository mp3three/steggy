import { InternalEventActivateDTO } from '@steggy/controller-shared';
import { Form, Input, Select, Space } from 'antd';

export const ALL_EVENTS = [
  'GROUP_UPDATE',
  'ROOM_UPDATE',
  'PERSON_UPDATE',
  'ROUTINE_UPDATE',
  'LOCATION_UPDATED',
  'ALL_ENTITIES_UPDATED',
  'CONNECTION_RESET',
  'HA_SOCKET_READY',
  'HA_EVENT_STATE_CHANGE',
];

export function RoutineActivateInternalEvent(props: {
  activate: InternalEventActivateDTO;
  onUpdate: (activate: Partial<InternalEventActivateDTO>) => void;
}) {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Event Stream">
        <Select
          value={props.activate?.event}
          onChange={event => props.onUpdate({ event })}
        >
          {ALL_EVENTS.map(event => (
            <Select.Option key={event} value={event}>
              {event}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Filter events">
        <Input.TextArea
          defaultValue={props.activate?.validate}
          style={{ minHeight: '150px' }}
          onBlur={({ target }) => props.onUpdate({ validate: target.value })}
        />
      </Form.Item>
    </Space>
  );
}
