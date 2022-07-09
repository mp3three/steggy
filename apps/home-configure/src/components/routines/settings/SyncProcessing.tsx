import { RoutineCommandSettings, RoutineDTO } from '@steggy/controller-shared';
import { Checkbox, Descriptions, Form, Popover, Typography } from 'antd';
import { FD_ICONS, sendRequest } from 'apps/home-configure/src/types';
import { useEffect, useState } from 'react';

export function SyncProcessing(props: {
  onUpdate: (routine: Partial<RoutineDTO>) => void;
  routine: RoutineDTO;
}) {
  const [commandList, setCommandList] = useState<RoutineCommandSettings[]>([]);

  useEffect(() => {
    async function refresh() {
      setCommandList(
        await sendRequest<RoutineCommandSettings[]>({
          url: `/debug/routine-command`,
        }),
      );
    }
    refresh();
  }, []);
  return (
    <Form.Item label={`Synchronous command processing `}>
      <Checkbox
        checked={props.routine.sync}
        disabled={props.routine.command.some(({ type }) =>
          commandList.some(
            activate => activate.type === type && activate.syncOnly,
          ),
        )}
        onChange={({ target }) => props.onUpdate({ sync: target.checked })}
      >
        <Popover
          content={
            <Descriptions bordered style={{ width: '35vw' }}>
              <Descriptions.Item span={3} label="When checked">
                <Typography.Paragraph>
                  A command action must fully complete prior to the next command
                  running. This allows some commands, such as
                  <Typography.Text code>Stop Processing</Typography.Text>
                  to affect/prevent execution of following commands.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  Entity state changes require a confirmation from Home
                  Assistant, which may not always be instant.
                </Typography.Paragraph>
              </Descriptions.Item>
              <Descriptions.Item span={3} label="When unchecked">
                Actions will be initiated at the simultaniously, having no
                influence each other. Entity state changes are performed in a
                "fire and forget" manner.
              </Descriptions.Item>
            </Descriptions>
          }
        >
          {FD_ICONS.get('information')}
        </Popover>
      </Checkbox>
    </Form.Item>
  );
}
