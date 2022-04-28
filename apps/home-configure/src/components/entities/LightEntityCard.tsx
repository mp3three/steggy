import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import {
  ColorModes,
  LightAttributesDTO,
  LightStateDTO,
} from '@steggy/home-assistant-shared';
import { is, START } from '@steggy/utilities';
import {
  Button,
  Card,
  Divider,
  notification,
  Popconfirm,
  Radio,
  Skeleton,
  Slider,
  Space,
  Switch,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';

import { sendRequest } from '../../types';

const R = 0;
const G = 1;
const B = 2;

// eslint-disable-next-line radar/cognitive-complexity
export function LightEntityCard(props: {
  onRemove?: (entity_id: string) => void;
  onUpdate?: (
    state: GeneralSaveStateDTO,
    attribute: 'state' | 'color' | 'brightness',
  ) => void;
  optional?: boolean;
  selfContained?: boolean;
  state?: GeneralSaveStateDTO;
  title?: string;
}) {
  const attributes: LightAttributesDTO = props?.state?.extra ?? {};

  const [color, setColor] = useState<string>();
  const [disabled, setDisabled] = useState<boolean>(
    props.optional && is.undefined(props.state?.state),
  );
  const [friendly_name, setFriendlyName] = useState<string>();
  const [state, setState] = useState<string>(props.state.state);
  const [entity, setEntity] = useState<LightAttributesDTO>({
    brightness: attributes?.brightness,
    color_mode: attributes?.color_mode,
    rgb_color: attributes?.rgb_color,
  });
  const reference = props?.state?.ref;

  useEffect(() => {
    async function refresh() {
      if (!is.empty(props.title)) {
        setFriendlyName(props.title);
        return;
      }
      const entity = await sendRequest<LightStateDTO>({
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
      setFriendlyName(entity?.attributes?.friendly_name);
      if (props.selfContained) {
        setEntity({
          ...entity,
          brightness: entity.attributes.brightness,
          color_mode: entity.attributes.color_mode,
          rgb_color: entity.attributes.rgb_color,
        });
        setState(entity.state);
      }
    }
    refresh();
  }, [props.selfContained, props.title, reference]);

  function getSaveState(updateBrightness = brightness): GeneralSaveStateDTO {
    if (props.optional && disabled) {
      return undefined;
    }
    return {
      extra:
        entity.color_mode !== 'color_temp'
          ? {
              brightness: updateBrightness,
              color_mode: entity.color_mode,
              rgb_color: rgb_color,
            }
          : { brightness: updateBrightness, color_mode: entity.color_mode },
      ref: reference,
      state: state,
    };
  }

  async function brightnessChanged(
    brightness: number | number[],
  ): Promise<void> {
    brightness = Array.isArray(brightness) ? brightness[START] : brightness;
    const saveState = getSaveState(brightness);
    if (props.selfContained) {
      setEntity({
        ...entity,
      });
      const state = await sendRequest<LightStateDTO>({
        body: { brightness },
        method: 'put',
        url: `/entity/command/${saveState.ref}/${saveState.state}`,
      });
      state.attributes ??= {};
      setEntity({
        ...entity,
        brightness: state.attributes.brightness,
        color_mode: state.attributes.color_mode,
        rgb_color: state.attributes.rgb_color,
      });
      setState(state.state);
      return;
    }
    setEntity({ ...entity, brightness });
    if (props.onUpdate) {
      props.onUpdate(saveState, 'brightness');
    }
  }

  function getCurrentState(): string {
    if (is.empty(state) && !props.state) {
      return undefined;
    }
    if (state !== 'on') {
      return 'turnOff';
    }
    if (entity.color_mode === 'color_temp') {
      return 'circadianLight';
    }
    return 'turnOn';
  }

  function onModeChange(state: string): void {
    if (state === 'turnOff') {
      setEntity({
        ...entity,
        brightness: undefined,
        color_mode: undefined,
        rgb_color: undefined,
      });
      setState('off');
      onUpdate('state');
      return;
    }
    if (state === 'turnOn') {
      setEntity({
        ...entity,
        color_mode: undefined,
      });
      setState('on');
      onUpdate('state');
      return;
    }
    setEntity({
      ...entity,
      color_mode: 'color_temp' as ColorModes,
      rgb_color: undefined,
    });
    setState('on');
    onUpdate('state');
  }

  function onUpdate(type: 'color' | 'state'): void {
    setTimeout(async () => {
      const saveState = getSaveState();
      if (props.onUpdate) {
        props.onUpdate(saveState, type);
      }
      if (!props.selfContained) {
        return;
      }
      const state = await sendRequest<LightStateDTO>({
        body: saveState,
        method: 'put',
        url: `/entity/light-state/${saveState.ref}`,
      });
      setEntity({
        ...entity,
        brightness: state.attributes.brightness,
        color_mode: state.attributes.color_mode,
        rgb_color: state.attributes.rgb_color,
      });
      setState(state.state);
    }, 0);
  }

  function sendColorChange({ rgb, hex }: ColorResult): void {
    const { r, g, b } = rgb;
    setColor(hex);
    setEntity({ ...entity, rgb_color: [r, g, b] });
    onUpdate('color');
  }

  if (!entity) {
    return (
      <Card title={reference} type="inner">
        <Skeleton />
      </Card>
    );
  }
  const { brightness, rgb_color } = entity;
  const entityState = getCurrentState();
  return (
    <Card
      title={friendly_name}
      type="inner"
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
      <Radio.Group
        buttonStyle="solid"
        value={entityState}
        disabled={disabled}
        onChange={({ target }) => onModeChange(target.value)}
      >
        <Radio.Button value="turnOff">Off</Radio.Button>
        <Radio.Button value="circadianLight">Circadian</Radio.Button>
        <Radio.Button value="turnOn">Color</Radio.Button>
      </Radio.Group>
      {entityState !== 'turnOff' ? (
        <>
          <Divider orientation="left">
            <Typography.Text type="secondary">Brightness</Typography.Text>
          </Divider>
          <Slider
            min={1}
            max={255}
            marks={{
              1: 'min',
              128: '1/2',
              170: '2/3',
              192: '3/4',
              255: 'max',
              64: '1/4',
              85: '1/3',
            }}
            value={brightness}
            onChange={brightness => setEntity({ ...entity, brightness })}
            onAfterChange={brightness => brightnessChanged(brightness)}
          />
        </>
      ) : undefined}
      {entityState === 'turnOn' && !disabled ? (
        <>
          <Divider />
          <ChromePicker
            color={
              color ?? {
                b: (rgb_color || [])[B],
                g: (rgb_color || [])[G],
                r: (rgb_color || [])[R],
              }
            }
            onChange={({ hex }) => setColor(hex)}
            onChangeComplete={change => sendColorChange(change)}
            disableAlpha={true}
          />
        </>
      ) : undefined}
    </Card>
  );
}
