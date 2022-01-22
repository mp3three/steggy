import { LightStateDTO } from '@text-based/home-assistant-shared';
import { sleep } from '@text-based/utilities';
import { Card, Radio, Spin } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tStateType = { entity: LightStateDTO };

export class LightGroupCard extends React.Component<
  { entity_id: string },
  tStateType
> {
  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { entity } = this.state;
    const entityState = this.getCurrentState();
    return (
      <Card title={entity.attributes.friendly_name} type="inner" hoverable>
        <Radio.Group
          value={entityState}
          onChange={this.onModeChange.bind(this)}
        >
          <Radio.Button value="off">Off</Radio.Button>
          <Radio.Button value="circadian">Circadian</Radio.Button>
          <Radio.Button value="on">Color</Radio.Button>
        </Radio.Group>
      </Card>
    );
  }

  private getCurrentState(): string {
    const { entity } = this.state;
    if (entity.state === 'off') {
      return 'off';
    }
    if (entity.attributes.color_mode === 'color_temp') {
      return 'circadian';
    }
    return 'on';
  }

  private async onModeChange(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const action = {
      circadian: 'circadianLight',
      off: 'turnOff',
      on: 'turnOn',
    }[target.value];
    await sendRequest<LightStateDTO>(
      `/entity/command/${this.props.entity_id}/${action}`,
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
    this.setState({ entity });
  }

  private renderWaiting() {
    return (
      <Card title={this.props.entity_id} type="inner">
        <Spin />
      </Card>
    );
  }
}
