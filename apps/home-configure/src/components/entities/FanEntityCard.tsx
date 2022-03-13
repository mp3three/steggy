import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { RoomEntitySaveStateDTO } from '@automagical/controller-shared';
import {
  FanAttributesDTO,
  FanStateDTO,
} from '@automagical/home-assistant-shared';
import { is, PERCENT, SINGLE, START } from '@automagical/utilities';
import {
  Button,
  Card,
  Divider,
  Popconfirm,
  Radio,
  Slider,
  Space,
  Spin,
  Switch,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tStateType = {
  disabled?: boolean;
  friendly_name?: string;
  percentage: number;
  percentage_step: number;
  state?: string;
};
const FOUR_STEP = 25;
const OFF = 0;

export class FanEntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate?: (state: RoomEntitySaveStateDTO) => void;
    optional?: boolean;
    relative?: boolean;
    selfContained?: boolean;
    state?: RoomEntitySaveStateDTO<FanAttributesDTO>;
    stateOnly?: boolean;
    title?: string;
  },
  tStateType
> {
  private latestRequest: Date;
  private get disabled(): boolean {
    if (!this.props.optional) {
      return false;
    }
    return !!this.state.disabled;
  }

  private get ref(): string {
    return this.props?.state?.ref;
  }

  override async componentDidMount(): Promise<void> {
    this.setState({
      percentage: this.props?.state?.extra?.percentage,
      state: this.props?.state?.state ?? 'setFanSpeed',
    });
    if (this.props.optional) {
      this.setState({
        disabled: is.undefined(this.props.state?.state),
      });
    }

    await this.refresh();
  }

  public getSaveState(): RoomEntitySaveStateDTO {
    if (this.disabled) {
      return undefined;
    }
    return {
      extra: {
        percentage: this.state.percentage,
      },
      ref: this.ref,
      state: this.state.state || 'off',
    };
  }

  public load(state: FanStateDTO): void {
    const percentage_step = this.getPercentageStep(state);
    if (!this.props.selfContained) {
      this.setState({
        friendly_name: state.attributes.friendly_name,
        percentage_step,
      });
      return;
    }
    const percentage = this.getPercentage(state);
    this.setState({
      friendly_name: state.attributes.friendly_name,
      percentage,
      percentage_step,
      state: state.state,
    });
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { friendly_name, percentage, percentage_step, disabled, state } =
      this.state;
    return (
      <Card
        title={friendly_name}
        type="inner"
        style={{
          minWidth: '300px',
        }}
        extra={
          <Space style={{ margin: '0 -16px 0 16px' }}>
            {this.props.optional ? (
              <Switch
                defaultChecked={!disabled}
                onChange={state => this.setState({ disabled: !state })}
              />
            ) : undefined}
            {is.undefined(this.props.onRemove) ? undefined : (
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title="Are you sure you want to remove this?"
                onConfirm={() => this.props.onRemove(this.ref)}
              >
                <Button size="small" type="text" danger>
                  <CloseOutlined />
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
      >
        {this.props.relative ? (
          <>
            <Radio.Group
              value={state}
              onChange={({ target }) => this.onTypeChange(target.value)}
            >
              <Radio value="fanSpeedUp">Speed Up</Radio>
              <Radio value="fanSpeedDown">Speed Down</Radio>
              <Radio value="setFanSpeed">Absolute</Radio>
            </Radio.Group>
            <Divider />
          </>
        ) : undefined}
        <Slider
          value={percentage}
          marks={this.getMarks()}
          disabled={this.props.relative && state !== 'setFanSpeed'}
          step={percentage_step}
          onChange={this.onSpeedChange.bind(this)}
        />
      </Card>
    );
  }

  private getMarks() {
    const out: Record<number, string> = {};
    for (let i = START; i <= 100; i = i + this.state.percentage_step) {
      out[i] = `${i}%`;
    }
    return out;
  }

  private getPercentage(state: FanStateDTO): number {
    if (state.state === 'off') {
      return OFF;
    }
    if (
      is.number(state.attributes.percentage) &&
      state.attributes.percentage > OFF
    ) {
      return state.attributes.percentage;
    }
    const { speed_list, speed } = state.attributes;
    if (is.empty(speed_list) || is.empty(speed)) {
      return OFF;
    }
    const step_size = this.getPercentageStep(state);
    return speed_list.indexOf(speed) * step_size;
  }

  private getPercentageStep(state: FanStateDTO): number {
    if (state.attributes.percentage_step > SINGLE) {
      return state.attributes.percentage_step;
    }
    if (
      Array.isArray(state.attributes.speed_list) &&
      !is.empty(state.attributes.speed_list)
    ) {
      return (
        PERCENT / state.attributes.speed_list.filter(i => i !== 'off').length
      );
    }
    return FOUR_STEP;
  }

  private async onSpeedChange(percentage: number): Promise<void> {
    await this.setState({ percentage, state: 'setFanSpeed' });
    if (this.props.onUpdate) {
      this.props.onUpdate({
        extra: {
          percentage: this.state.percentage,
        },
        ref: this.ref,
        state: 'setFanSpeed',
      });
    }
    if (!this.props.selfContained) {
      return;
    }
    const now = new Date();
    this.latestRequest = now;
    const entity = await sendRequest<FanStateDTO>({
      body: {
        percentage,
      },
      method: 'put',
      url: `/entity/command/${this.ref}/setSpeed`,
    });
    if (this.latestRequest !== now) {
      return;
    }
    this.load(entity);
  }

  private onTypeChange(state: string): void {
    this.setState({ state });
    if (this.props.onUpdate) {
      this.props.onUpdate({
        extra: {
          percentage: this.state.percentage,
        },
        ref: this.ref,
        state: state,
      });
    }
  }

  private async refresh(): Promise<void> {
    if (!is.empty(this.props.title)) {
      this.setState({
        friendly_name: this.props.title,
      });
      return;
    }
    const entity = await sendRequest<FanStateDTO>({
      url: `/entity/id/${this.ref}`,
    });
    this.load(entity);
  }

  private renderWaiting() {
    return (
      <Card title={this.ref} type="inner">
        <Spin />
      </Card>
    );
  }
}
