import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { RoomEntitySaveStateDTO } from '@automagical/controller-shared';
import {
  ColorModes,
  LightAttributesDTO,
  LightStateDTO,
} from '@automagical/home-assistant-shared';
import { is, START } from '@automagical/utilities';
import {
  Button,
  Card,
  Divider,
  Popconfirm,
  Radio,
  Skeleton,
  Slider,
  Space,
  Switch,
  Typography,
} from 'antd';
import React from 'react';
import { ChromePicker, ColorResult } from 'react-color';

import { sendRequest } from '../../types';

type tStateType = {
  color?: string;
  disabled?: boolean;
  friendly_name?: string;
  state?: string;
} & LightAttributesDTO;
const R = 0;
const G = 1;
const B = 2;

export class LightEntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate?: (
      state: RoomEntitySaveStateDTO,
      attribute: 'state' | 'color' | 'brightness',
    ) => void;
    optional?: boolean;
    selfContained?: boolean;
    state?: RoomEntitySaveStateDTO;
    title?: string;
  },
  tStateType
> {
  private get attributes(): LightAttributesDTO {
    return this.props?.state?.extra ?? {};
  }

  private get ref(): string {
    return this.props?.state?.ref;
  }

  override async componentDidMount(): Promise<void> {
    this.setState({
      brightness: this.attributes.brightness,
      color_mode: this.attributes.color_mode,
      rgb_color: this.attributes.rgb_color,
      state: this.props?.state?.state,
    });
    if (this.props.optional) {
      this.setState({
        disabled: is.undefined(this.props.state?.state),
      });
    }
    await this.refresh();
  }

  public getSaveState(
    brightness = this.state.brightness,
  ): RoomEntitySaveStateDTO {
    if (this.props.optional && this.state.disabled) {
      return undefined;
    }
    return {
      extra:
        this.state.color_mode !== 'color_temp'
          ? {
              brightness,
              color_mode: this.state.color_mode,
              rgb_color: this.state.rgb_color,
            }
          : { brightness, color_mode: this.state.color_mode },
      ref: this.ref,
      state: this.state.state,
    };
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { color, friendly_name, brightness, rgb_color, disabled } =
      this.state;
    const entityState = this.getCurrentState();
    return (
      <Card
        title={friendly_name}
        type="inner"
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
        <Radio.Group
          value={entityState}
          disabled={disabled}
          onChange={this.onModeChange.bind(this)}
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
              onChange={this.updateBrightness.bind(this)}
              onAfterChange={this.brightnessChanged.bind(this)}
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
              onChange={this.updateColor.bind(this)}
              onChangeComplete={this.sendColorChange.bind(this)}
              disableAlpha={true}
            />
          </>
        ) : undefined}
      </Card>
    );
  }

  private async brightnessChanged(
    brightness: number | number[],
  ): Promise<void> {
    brightness = Array.isArray(brightness) ? brightness[START] : brightness;
    const saveState = this.getSaveState(brightness);
    if (this.props.selfContained) {
      this.setState({ brightness });
      const state = await sendRequest<LightStateDTO>({
        body: { brightness },
        method: 'put',
        url: `/entity/command/${saveState.ref}/${saveState.state}`,
      });
      state.attributes ??= {};
      this.setState({
        brightness: state.attributes.brightness,
        color_mode: state.attributes.color_mode,
        rgb_color: state.attributes.rgb_color,
        state: state.state,
      });
      return;
    }
    this.setState({ brightness });
    if (this.props.onUpdate) {
      this.props.onUpdate(saveState, 'brightness');
    }
  }

  private getCurrentState(): string {
    const state = this.state?.state;
    if (is.empty(state) && !this.props.state) {
      return undefined;
    }
    if (state !== 'on') {
      return 'turnOff';
    }
    if (this.state.color_mode === 'color_temp') {
      return 'circadianLight';
    }
    return 'turnOn';
  }

  private onModeChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const state = e.target.value;
    if (state === 'turnOff') {
      this.setState({
        brightness: undefined,
        color_mode: undefined,
        rgb_color: undefined,
        state: 'off',
      });
      this.onUpdate('state');
      return;
    }
    if (state === 'turnOn') {
      this.setState({
        color_mode: undefined,
        state: 'on',
      });
      this.onUpdate('state');
      return;
    }
    this.setState({
      color_mode: 'color_temp' as ColorModes,
      rgb_color: undefined,
      state: 'on',
    });
    this.onUpdate('state');
  }

  private onUpdate(type: 'color' | 'state'): void {
    setTimeout(async () => {
      const saveState = this.getSaveState();
      if (this.props.onUpdate) {
        this.props.onUpdate(saveState, type);
      }
      if (!this.props.selfContained) {
        return;
      }
      const state = await sendRequest<LightStateDTO>({
        body: saveState,
        method: 'put',
        url: `/entity/light-state/${saveState.ref}`,
      });
      this.setState({
        brightness: state.attributes.brightness,
        color_mode: state.attributes.color_mode,
        rgb_color: state.attributes.rgb_color,
        state: state.state,
      });
    }, 0);
  }

  private async refresh(): Promise<void> {
    if (!is.empty(this.props.title)) {
      this.setState({
        friendly_name: this.props.title,
      });
      return;
    }
    const entity = await sendRequest<LightStateDTO>({
      url: `/entity/id/${this.ref}`,
    });
    this.setState({ friendly_name: entity.attributes.friendly_name });
    if (this.props.selfContained) {
      this.setState({
        brightness: entity.attributes.brightness,
        color_mode: entity.attributes.color_mode,
        rgb_color: entity.attributes.rgb_color,
        state: entity.state,
      });
    }
  }

  private renderWaiting() {
    return (
      <Card title={this.ref} type="inner">
        <Skeleton />
      </Card>
    );
  }

  private sendColorChange({ rgb, hex }: ColorResult): void {
    const { r, g, b } = rgb;
    this.setState({ color: hex, rgb_color: [r, g, b] });
    this.onUpdate('color');
  }

  private updateBrightness(brightness: number): void {
    this.setState({ brightness });
  }

  private updateColor({ hex }: ColorResult) {
    this.setState({ color: hex });
  }
}
