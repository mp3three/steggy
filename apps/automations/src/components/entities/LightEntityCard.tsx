import { CloseOutlined } from '@ant-design/icons';
import { RoomEntitySaveStateDTO } from '@text-based/controller-shared';
import {
  ColorModes,
  LightAttributesDTO,
  LightStateDTO,
} from '@text-based/home-assistant-shared';
import { is } from '@text-based/utilities';
import {
  Button,
  Card,
  Divider,
  Popconfirm,
  Radio,
  Slider,
  Spin,
  Typography,
} from 'antd';
import React from 'react';
import { ChromePicker, ColorResult } from 'react-color';

import { sendRequest } from '../../types';

type tStateType = {
  color?: string;
  friendly_name?: string;
  state?: string;
} & LightAttributesDTO;
const R = 0;
const G = 1;
const B = 2;

export class LightEntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate: (
      state: RoomEntitySaveStateDTO,
      attribute: 'state' | 'color' | 'brightness',
    ) => void;
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
    await this.refresh();
  }

  public getSaveState(): RoomEntitySaveStateDTO {
    return {
      extra: {
        brightness: this.state.brightness,
        color_mode: this.state.color_mode,
        rgb_color: this.state.rgb_color,
      },
      ref: this.ref,
      state: this.state.state || 'off',
    };
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { color, friendly_name, brightness, rgb_color } = this.state;
    const entityState = this.getCurrentState();
    return (
      <Card
        title={friendly_name}
        type="inner"
        extra={
          is.undefined(this.props.onRemove) ? undefined : (
            <Popconfirm
              title="Are you sure you want to remove this?"
              onConfirm={() => this.props.onRemove(this.ref)}
            >
              <Button size="small" type="text" danger>
                <CloseOutlined />
              </Button>
            </Popconfirm>
          )
        }
      >
        <Radio.Group
          value={entityState}
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
              value={brightness}
              onChange={this.updateBrightness.bind(this)}
              onAfterChange={this.brightnessChanged.bind(this)}
            />
          </>
        ) : undefined}
        {entityState === 'turnOn' ? (
          <>
            {' '}
            <Divider />{' '}
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

  private brightnessChanged(brightness: number): void {
    this.setState({ brightness });
    this.props.onUpdate(
      {
        extra: {
          brightness,
          color_mode: this.state.color_mode,
          rgb_color: this.state.rgb_color,
        },
        ref: this.ref,
        state: this.state.state,
      },
      'brightness',
    );
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

  private onModeChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    const state = target.value;
    console.log(state);
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
    setTimeout(() => {
      this.props.onUpdate(this.getSaveState(), type);
    }, 0);
  }

  private async refresh(): Promise<void> {
    if (!is.empty(this.props.title)) {
      this.setState({
        friendly_name: this.props.title,
      });
      return;
    }
    const entity = await sendRequest<LightStateDTO>(`/entity/id/${this.ref}`);
    this.setState({ friendly_name: entity.attributes.friendly_name });
  }

  private renderWaiting() {
    return (
      <Card title={this.ref} type="inner">
        <Spin />
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
