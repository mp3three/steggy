import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { FanAttributesDTO, FanStateDTO } from '@steggy/home-assistant-shared';
import { is, PERCENT, SINGLE, START } from '@steggy/utilities';
import {
  Button,
  Card,
  Divider,
  notification,
  Popconfirm,
  Radio,
  Slider,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';

const FOUR_STEP = 25;
const OFF = 0;

let latestRequest: Date;

// eslint-disable-next-line radar/cognitive-complexity
export function FanEntityCard(props: {
  onRemove?: (entity_id: string) => void;
  onUpdate?: (state: GeneralSaveStateDTO) => void;
  optional?: boolean;
  relative?: boolean;
  selfContained?: boolean;
  state?: GeneralSaveStateDTO<FanAttributesDTO>;
  stateOnly?: boolean;
  title?: string;
}) {
  const [disabled, setDisabled] = useState<boolean>(
    props.optional && is.undefined(props.state?.state),
  );
  const [friendly_name, setFriendlyName] = useState<string>();
  const [percentage, setPercentage] = useState<number>(
    props?.state?.extra?.percentage,
  );
  const [percentage_step, setPercentageStep] = useState<number>();
  const [state, setState] = useState<string>(
    props.state.state ?? 'setFanSpeed',
  );
  const reference = props?.state?.ref;

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  function getMarks() {
    const out: Record<number, string> = {};
    for (let i = START; i <= 100; i = i + percentage_step) {
      out[i] = `${i}%`;
    }
    return out;
  }

  async function refresh(): Promise<void> {
    if (!is.empty(props.title)) {
      setFriendlyName(props.title);
      return;
    }
    const entity = await sendRequest<FanStateDTO>({
      url: `/entity/id/${reference}`,
    });
    if (is.undefined(entity.attributes)) {
      notification.open({
        description: (
          <Typography>
            {`Server returned bad response. Verify that `}
            <Typography.Text code>{reference}</Typography.Text> still exists?
          </Typography>
        ),
        message: 'Entity not found',
        type: 'error',
      });
      return;
    }
    load(entity);
  }

  function onTypeChange(state: string): void {
    setState(state);
    if (props.onUpdate) {
      props.onUpdate({
        extra: {
          percentage: percentage,
        },
        ref: reference,
        state: state,
      });
    }
  }

  function load(state: FanStateDTO): void {
    const percentage_step = getPercentageStep(state);
    if (!props.selfContained) {
      setFriendlyName(state.attributes.friendly_name);
      setPercentageStep(percentage_step);
      return;
    }
    const percentage = getPercentage(state);
    setFriendlyName(state.attributes.friendly_name);
    setPercentageStep(percentage_step);
    setPercentage(percentage);
    setState(state.state);
  }

  async function onSpeedChange(percentage: number): Promise<void> {
    setPercentage(percentage);
    setState('setFanSpeed');
    if (props.onUpdate) {
      props.onUpdate({
        extra: {
          percentage,
        },
        ref: reference,
        state: 'setFanSpeed',
      });
    }
    if (!props.selfContained) {
      return;
    }
    const now = new Date();
    latestRequest = now;
    const entity = await sendRequest<FanStateDTO>({
      body: {
        percentage,
      },
      method: 'put',
      url: `/entity/command/${reference}/setSpeed`,
    });
    if (latestRequest !== now) {
      return;
    }
    load(entity);
  }

  function getPercentageStep(state: FanStateDTO): number {
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

  function getPercentage(state: FanStateDTO): number {
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
    const step_size = getPercentageStep(state);
    return speed_list.indexOf(speed) * step_size;
  }

  if (is.empty(state)) {
    return (
      <Card title={reference} type="inner">
        <Spin />
      </Card>
    );
  }
  return (
    <Card
      title={friendly_name}
      type="inner"
      style={{
        minWidth: '300px',
      }}
      extra={
        <Space style={{ margin: '0 -16px 0 16px' }}>
          {props.optional ? (
            <Switch
              defaultChecked={!disabled}
              onChange={state => setDisabled(!state)}
            />
          ) : undefined}
          {is.undefined(props.onRemove) ? undefined : (
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              title="Are you sure you want to remove this?"
              onConfirm={() => props.onRemove(reference)}
            >
              <Button size="small" type="text" danger>
                <CloseOutlined />
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      {props.relative ? (
        <>
          <Radio.Group
            buttonStyle="solid"
            value={state}
            onChange={({ target }) => onTypeChange(target.value)}
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
        marks={getMarks()}
        disabled={disabled || (props.relative && state !== 'setFanSpeed')}
        step={percentage_step}
        onChange={speed => onSpeedChange(speed)}
      />
    </Card>
  );
}
