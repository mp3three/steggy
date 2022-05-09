import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Descriptions, Empty, Space, Tabs, Typography } from 'antd';

import { sendRequest } from '../../types';
import { ActivateList } from './activate';
import { ActivateHistory } from './ActivateHistory';
import { CommandList } from './command';
import { RoutineEnabled } from './RoutineEnabled';
import { RoutineExtraActions } from './RoutineExtraActions';
import { RoutineSettings } from './RoutineSettings';

export function RoutineListDetail(props: {
  nested?: boolean;
  onClone?: (routine: RoutineDTO) => void;
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
            label={<Typography.Text type="success">Enabled</Typography.Text>}
            span={3}
          >
            asdf
          </Descriptions.Item>
          <Descriptions.Item
            label={<Typography.Text type="warning">Enabled</Typography.Text>}
            span={3}
          >
            asdf
          </Descriptions.Item>
          <Descriptions.Item
            label={<Typography.Text type="danger">Disabled</Typography.Text>}
            span={3}
          >
            asdf
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
            onUpdate={update => onUpdate(update)}
          />
        )
      }
    >
      {renderCard()}
    </Card>
  );
}
