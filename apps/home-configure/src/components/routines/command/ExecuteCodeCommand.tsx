import {
  RoutineCodeCommandDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';
import { Form, Input, Tabs } from 'antd';

import { TypedEditor } from '../../misc';
const VALIDATION = new RegExp('^[A-Za-z0-9_-]*$', 'g');

export function ExecuteCodeCommand(props: {
  command?: RoutineCommandDTO<RoutineCodeCommandDTO>;
  onUpdate: (command: Partial<RoutineCodeCommandDTO>) => void;
}) {
  return (
    <Tabs>
      <Tabs.TabPane tab="Code" key="code">
        <TypedEditor
          code={props.command?.command?.code ?? ''}
          type="execute"
          key={props.command?.id}
          onUpdate={code => props.onUpdate({ code })}
        />
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
            defaultValue={props.command?.command?.logContext}
            onBlur={({ target }) =>
              props.onUpdate({ logContext: target.value })
            }
          />
        </Form.Item>
      </Tabs.TabPane>
    </Tabs>
  );
}
