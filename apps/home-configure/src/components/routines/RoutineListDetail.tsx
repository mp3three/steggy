import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Descriptions, Empty, Space, Tabs, Typography } from 'antd';

import { FD_ICONS, sendRequest } from '../../types';
import { ActivateList } from './activate';
import { ActivateHistory } from './ActivateHistory';
import { CommandList } from './command';
import { RoutineEnabled } from './RoutineEnabled';
import { RoutineExtraActions } from './RoutineExtraActions';
import { RoutineSettings } from './RoutineSettings';

export function RoutineListDetail(props: {
  nested?: boolean;
  onClone?: (routine: RoutineDTO) => void;
  onLoad?: (routine: string) => void;
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  async function rename(friendlyName: string): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body: { friendlyName },
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    onUpdate(routine);
  }

  function onUpdate(routine: RoutineDTO) {
    if (props.onUpdate) {
      props.onUpdate(routine);
    }
  }

  function renderEmpty() {
    return (
      <Space style={{ width: '100%' }} align="center" direction="vertical">
        <Empty description="Select a routine" />
        <Descriptions bordered style={{ width: '100%' }}>
          <Descriptions.Item
            label={
              <Typography.Text type="success" strong>
                Enabled
              </Typography.Text>
            }
            span={3}
          >
            Routine is enabled, has commands to execute, and activation events
            to self activate.
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Typography.Text type="warning" strong>
                Enabled
              </Typography.Text>
            }
            span={3}
          >
            Routine is enabled, but is missing activation events or commands. If
            children are present, then this color will be used if activations OR
            commands are present, but not both.
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Typography.Text type="danger" strong>
                Disabled
              </Typography.Text>
            }
            span={3}
          >
            Routine will not respond to activation attempts. If child routines
            are present, those are disabled also.
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Typography.Text code>
                {FD_ICONS.get('folder')} {FD_ICONS.get('folder_open')}
              </Typography.Text>
            }
            span={3}
          >
            Routine contains children, but no activation events / commands of
            it's own.
          </Descriptions.Item>
        </Descriptions>
      </Space>
    );
  }

  function renderCard() {
    if (!props.routine) {
      return renderEmpty();
    }
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Title
          level={3}
          editable={{ onChange: value => rename(value) }}
        >
          {props.routine.friendlyName}
        </Typography.Title>
        <Tabs>
          <Tabs.TabPane tab="Enabled" key="enabled">
            <RoutineEnabled
              routine={props.routine}
              onUpdate={routine => onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <>
                <Typography.Text type="secondary">
                  ({props.routine.activate.length})
                </Typography.Text>
                {` Activations`}
              </>
            }
            key="activate"
          >
            <ActivateList
              highlight={is.empty(props.routine.activate)}
              routine={props.routine}
              onUpdate={routine => onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <>
                <Typography.Text type="secondary">
                  ({props.routine.command.length})
                </Typography.Text>
                {` Commands`}
              </>
            }
            key="command"
          >
            <CommandList
              highlight={is.empty(props.routine.command)}
              routine={props.routine}
              onUpdate={routine => onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="History" key="history">
            <ActivateHistory
              routine={props.routine}
              onUpdate={update => onUpdate(update)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Settings" key="settings">
            <RoutineSettings
              routine={props.routine}
              onUpdate={routine => onUpdate(routine)}
            />
          </Tabs.TabPane>
        </Tabs>
      </Space>
    );
  }

  if (props.nested) {
    return renderCard();
  }
  return (
    <Card
      title={<Typography.Text strong>Routine details</Typography.Text>}
      extra={
        !props.routine ? undefined : (
          <RoutineExtraActions
            routine={props.routine}
            onClone={props.onClone}
            onLoad={routine => props.onLoad(routine)}
            onUpdate={update => onUpdate(update)}
          />
        )
      }
    >
      {renderCard()}
    </Card>
  );
}
