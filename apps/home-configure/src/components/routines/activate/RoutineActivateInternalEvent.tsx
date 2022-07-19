/* eslint-disable radar/no-duplicate-string */
import {
  InternalEventActivateDTO,
  RoutineActivateDTO,
} from '@steggy/controller-shared';
import { is, LABEL, VALUE } from '@steggy/utilities';
import { Form, Input, Select, Space, Tabs, Typography } from 'antd';

import { TypedEditor } from '../../misc';

export const ALL_EVENTS = [
  'GROUP_UPDATE',
  'ROOM_UPDATE',
  'PERSON_UPDATE',
  'ROUTINE_UPDATE',
  'ALL_ENTITIES_UPDATED',
  'CONNECTION_RESET',
  'HA_EVENT_STATE_CHANGE',
];

const types = new Map<
  string,
  { help: [string, string | string[]]; types: string }
>([
  [
    'GROUP_UPDATE',
    {
      help: [
        'Fired when a group is modified. Different variables will be passed based on the type of action.',
        ['updated', 'created', 'deleted'],
      ],
      types: [
        'declare const updated: GroupDTO;',
        'declare const created: GroupDTO;',
        'declare const deleted: string',
      ].join(`\n`),
    },
  ],
  [
    'ROOM_UPDATE',
    {
      help: [
        'Fired when a room is modified. Different variables will be passed based on the type of action.',
        ['updated', 'created', 'deleted'],
      ],
      types: [
        'declare const updated: RoomDTO;',
        'declare const created: RoomDTO;',
        'declare const deleted: string',
      ].join(`\n`),
    },
  ],
  [
    'PERSON_UPDATE',
    {
      help: [
        'Fired when a person is modified. Different variables will be passed based on the type of action.',
        ['updated', 'created', 'deleted'],
      ],
      types: [
        'declare const updated: PersonDTO;',
        'declare const created: PersonDTO;',
        'declare const deleted: string',
      ].join(`\n`),
    },
  ],
  [
    'ROUTINE_UPDATE',
    {
      help: [
        'Fired when a routine is modified. Different variables will be passed based on the type of action.',
        ['updated', 'created', 'deleted'],
      ],
      types: [
        'declare const updated: RoutineDTO;',
        'declare const created: RoutineDTO;',
        'declare const deleted: RoutineDTO',
      ].join(`\n`),
    },
  ],
  [
    'ALL_ENTITIES_UPDATED',
    {
      help: [
        'Fired when a room is modified. Different variables will be passed based on the type of action.',
        ['states'],
      ],
      types: 'declare const states: HassStateDTO[];',
    },
  ],
  [
    'CONNECTION_RESET',
    {
      help: [
        'Fired when the websocket connection to Home Assistant is restored, after prevously being connected & dropped.',
        'No extra variables provided',
      ],
      types: '',
    },
  ],
  [
    'HA_EVENT_STATE_CHANGE',
    {
      help: [
        'Fired when a single entity update is received',
        ['new_state', 'old_state', 'entity_id'],
      ],
      types: [
        'declare const new_state: HassStateDTO;',
        'declare const old_state: HassStateDTO;',
        'declare const entity_id: string',
      ].join(`\n`),
    },
  ],
]);

const VALIDATION = new RegExp('^[A-Za-z0-9_-]*$', 'g');
export function RoutineActivateInternalEvent(props: {
  activate: RoutineActivateDTO;
  activateProperties: InternalEventActivateDTO;
  onUpdate: (activate: Partial<InternalEventActivateDTO>) => void;
}) {
  const details = types.get(props.activateProperties?.event);
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Event Stream">
        <Select
          value={props.activateProperties?.event}
          onChange={event => props.onUpdate({ event })}
        >
          {ALL_EVENTS.map(event => (
            <Select.Option key={event} value={event}>
              {event}
            </Select.Option>
          ))}
        </Select>
        <Typography.Text type="secondary">
          {details?.help[LABEL]}
        </Typography.Text>
      </Form.Item>
      <Tabs>
        <Tabs.TabPane tab="Editor" key="editor">
          <Form.Item>
            <TypedEditor
              key={props.activate.id}
              noTopLevelReturn
              secondaryText={
                <Space direction="vertical">
                  {details ? (
                    <Space>
                      <Typography.Text strong>
                        {'Available variables: '}
                      </Typography.Text>
                      {is.string(details?.help[VALUE])
                        ? details?.help[VALUE]
                        : (details?.help[VALUE] as string[]).map(i => (
                            <Typography.Text key={i} code>
                              {i}
                            </Typography.Text>
                          ))}
                    </Space>
                  ) : undefined}
                  <Typography>
                    <Typography.Text code>return true</Typography.Text>
                    {` to trigger routine`}
                  </Typography>
                </Space>
              }
              extraTypes={types.get(props.activateProperties?.event)?.types}
              code={props.activateProperties?.validate}
              onUpdate={validate => props.onUpdate({ validate })}
            />
          </Form.Item>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Settings" key="settings">
          <Form.Item
            labelCol={{ span: 6 }}
            label="Custom log context"
            rules={[{ pattern: VALIDATION, type: 'regexp' }]}
          >
            <Input
              placeholder="execute"
              prefix="VM:"
              defaultValue={props.activateProperties?.logContext}
              onBlur={({ target }) =>
                props.onUpdate({ logContext: target.value })
              }
            />
          </Form.Item>
        </Tabs.TabPane>
      </Tabs>
    </Space>
  );
}
