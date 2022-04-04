import { RoutineDTO, RoutineEnableDTO } from '@automagical/controller-shared';
import { Card, Divider, Form, Input, Radio, Tooltip } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { StopProcessingCommand } from './command';

type tState = {
  name: string;
};

export class RoutineEnabled extends React.Component<
  {
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

  private get disablePolling(): boolean {
    if (
      !['enable_rules', 'disable_rules'].includes(
        this.props.routine?.enable?.type,
      )
    ) {
      return true;
    }
    return !(this.props.routine.enable?.comparisons ?? []).some(({ type }) =>
      ['webhook', 'template'].includes(type),
    );
  }

  override render() {
    return (
      <Card type="inner">
        <Form.Item label="Enable type">
          <Radio.Group
            buttonStyle="solid"
            value={this.props.routine.enable?.type ?? 'enable'}
            onChange={({ target }) => this.setType(target.value)}
          >
            <Radio.Button value="enable">Enable</Radio.Button>
            <Radio.Button value="disable">Disable</Radio.Button>
            <Radio.Button value="enable_rules">Enable w/ rules</Radio.Button>
            <Radio.Button value="disable_rules">Disable w/ rules</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={
            <Tooltip title="Rules involving template / webhook tests work through polling">
              Polling Interval
            </Tooltip>
          }
        >
          <Input
            type="number"
            defaultValue={this.props.routine.enable?.poll ?? 60 * 60}
            suffix="seconds"
            disabled={this.disablePolling}
            onChange={({ target }) => this.setPolling(Number(target.value))}
          />
        </Form.Item>
        <Divider orientation="left">Rules</Divider>
        <StopProcessingCommand
          disabled={
            !['enable_rules', 'disable_rules'].includes(
              this.props.routine?.enable?.type,
            )
          }
          command={this.props.routine?.enable}
          onUpdate={update => this.updateComparisons(update)}
        />
      </Card>
    );
  }

  private async setPolling(poll: number): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, poll },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async setType(type: string): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, type },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async updateComparisons(
    update: Partial<RoutineEnableDTO>,
  ): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, ...update },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(updated);
  }
}
