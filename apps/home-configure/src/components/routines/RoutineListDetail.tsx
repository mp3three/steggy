import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Empty, Space, Tabs, Typography } from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';
import { ActivateList } from './activate';
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
    props.onUpdate(routine);
  }

  function renderCard() {
    return !props.routine ? (
      <Empty description="Select a routine" />
    ) : (
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
              onUpdate={routine => props.onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <>
                {is.empty(props.routine.activate)
                  ? FD_ICONS.get('warning')
                  : undefined}
                Activation Events
              </>
            }
            key="activate"
          >
            <ActivateList
              highlight={is.empty(props.routine.activate)}
              routine={props.routine}
              onUpdate={routine => props.onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <>
                {is.empty(props.routine.command)
                  ? FD_ICONS.get('warning')
                  : undefined}
                Commands
              </>
            }
            key="command"
          >
            <CommandList
              highlight={is.empty(props.routine.command)}
              routine={props.routine}
              onUpdate={routine => props.onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Settings" key="settings">
            <RoutineSettings
              routine={props.routine}
              onUpdate={routine => props.onUpdate(routine)}
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
            onUpdate={props.onUpdate}
          />
        )
      }
    >
      {renderCard()}
    </Card>
  );
}
