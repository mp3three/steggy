import { RoutineDTO, RoutineEnableDTO } from '@steggy/controller-shared';
import { Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { StopProcessingCommand } from './command';

export function RoutineEnabled(props: {
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  function disablePolling(): boolean {
    if (
      !['enable_rules', 'disable_rules'].includes(props.routine?.enable?.type)
    ) {
      return true;
    }
    return !(props.routine.enable?.comparisons ?? []).some(({ type }) =>
      ['webhook', 'template'].includes(type),
    );
  }

  async function setPolling(poll: number): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...props.routine.enable, poll },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(updated);
  }

  async function setType(type: string): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...props.routine.enable, type },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(updated);
  }

  async function updateComparisons(
    update: Partial<RoutineEnableDTO>,
  ): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...props.routine.enable, ...update },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(updated);
  }

  return (
    <Card type="inner">
      <Form.Item
        label="Enable type"
        style={
          ['enable_rules', 'disable_rules'].includes(
            props.routine?.enable?.type,
          )
            ? undefined
            : { margin: '0' }
        }
      >
        <Radio.Group
          size="small"
          buttonStyle="solid"
          value={props.routine.enable?.type ?? 'enable'}
          onChange={({ target }) => setType(target.value)}
        >
          <Radio.Button value="enable">Enable</Radio.Button>
          <Radio.Button value="disable">Disable</Radio.Button>
          <Radio.Button value="enable_rules">Enable w/ rules</Radio.Button>
          <Radio.Button value="disable_rules">Disable w/ rules</Radio.Button>
        </Radio.Group>
      </Form.Item>
      {disablePolling() ? undefined : (
        <Form.Item
          label={
            <Tooltip title="Rules involving template / webhook tests work through polling">
              Polling Interval
            </Tooltip>
          }
        >
          <Input
            type="number"
            defaultValue={props.routine.enable?.poll ?? 60 * 60}
            suffix="seconds"
            disabled={disablePolling()}
            onBlur={({ target }) => setPolling(Number(target.value))}
          />
        </Form.Item>
      )}
      {['enable_rules', 'disable_rules'].includes(
        props.routine?.enable?.type,
      ) ? (
        <>
          <Divider orientation="left">Rules</Divider>
          <StopProcessingCommand
            disabled={
              !['enable_rules', 'disable_rules'].includes(
                props.routine?.enable?.type,
              )
            }
            command={props.routine?.enable}
            onUpdate={update => updateComparisons(update)}
          />
        </>
      ) : undefined}
    </Card>
  );
}
