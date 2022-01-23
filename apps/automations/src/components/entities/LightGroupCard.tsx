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

type tStateType = { brightness?: number; color: string; entity: LightStateDTO };
const R = 0;
const G = 1;
const B = 2;

export class LightGroupCard extends React.Component<
  { entity_id: string; onRemove?: (entity_id: string) => void },
  tStateType
> {
  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { color, entity, brightness } = this.state;
    const entityState = this.getCurrentState();
    return (
      <Card
        title={entity.attributes.friendly_name}
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
                  b: entity.attributes.rgb_color[R],
                  g: entity.attributes.rgb_color[G],
                  r: entity.attributes.rgb_color[B],
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
    await sendRequest(`/entity/light-state/${this.state.entity.entity_id}`, {
      body: JSON.stringify({ brightness }),
      method: 'put',
    });
  }

  private getCurrentState(): string {
    const { entity } = this.state;
    if (entity.state !== 'on') {
      return 'turnOff';
    }
    if (entity.attributes.color_mode === 'color_temp') {
      return 'circadianLight';
    }
    return 'turnOn';
  }

  private async onModeChange(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    await sendRequest<LightStateDTO>(
      `/entity/command/${this.props.entity_id}/${target.value}`,
      {
        method: 'put',
      },
    );
    await sleep(100);
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const { entity_id } = this.props;
    const entity = await sendRequest<LightStateDTO>(`/entity/id/${entity_id}`);
    this.setState({ brightness: entity.attributes.brightness, entity });
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
    await sendRequest(`/entity/light-state/${this.state.entity.entity_id}`, {
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
