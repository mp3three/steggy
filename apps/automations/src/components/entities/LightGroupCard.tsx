import { CloseOutlined } from '@ant-design/icons';
import {
  LightAttributesDTO,
  LightStateDTO,
} from '@text-based/home-assistant-shared';
import { is, sleep } from '@text-based/utilities';
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

type tStateType = { color: string; friendly_name: string } & LightAttributesDTO;
const R = 0;
const G = 1;
const B = 2;

export class LightGroupCard extends React.Component<
  {
    attributes: LightAttributesDTO;
    entity_id: string;
    onRemove?: (entity_id: string) => void;
    onStateChange: (entity_id: string, state: string) => void;
    state: string;
  },
  tStateType
> {
  override async componentDidMount(): Promise<void> {
    this.setState({ brightness: this.props.attributes.brightness });
    await this.refresh();
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
              onConfirm={() => this.props.onRemove(this.props.entity_id)}
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
                  b: (rgb_color || [])[R],
                  g: (rgb_color || [])[G],
                  r: (rgb_color || [])[B],
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

  private async brightnessChanged(brightness: number): Promise<void> {
    this.setState({ brightness });
    await sendRequest(`/entity/light-state/${this.props.entity_id}`, {
      body: JSON.stringify({ brightness }),
      method: 'put',
    });
  }

  private getCurrentState(): string {
    const state = this.props.state;
    if (state !== 'on') {
      return 'turnOff';
    }
    if (this.props.attributes.color_mode === 'color_temp') {
      return 'circadianLight';
    }
    return 'turnOn';
  }

  private onModeChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.props.onStateChange(this.props.entity_id, target.value);
  }

  private async refresh(): Promise<void> {
    const { entity_id } = this.props;
    const entity = await sendRequest<LightStateDTO>(`/entity/id/${entity_id}`);
    this.setState({ friendly_name: entity.attributes.friendly_name });
  }

  private renderWaiting() {
    return (
      <Card title={this.props.entity_id} type="inner">
        <Spin />
      </Card>
    );
  }

  private async sendColorChange({ rgb, hex }: ColorResult): Promise<void> {
    this.setState({ color: hex });
    const { r, g, b } = rgb;
    const data = {
      rgb_color: [r, g, b],
    } as LightAttributesDTO;
    console.log(data);
    await sendRequest(`/entity/light-state/${this.props.entity_id}`, {
      body: JSON.stringify(data),
      method: 'put',
    });
    console.log(data);
  }

  private updateBrightness(brightness: number): void {
    this.setState({ brightness });
  }

  private updateColor({ hex }: ColorResult) {
    this.setState({ color: hex });
  }
}
