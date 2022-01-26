import { CloseOutlined } from '@ant-design/icons';
import { RoomEntitySaveStateDTO } from '@text-based/controller-shared';
import {
  LightStateDTO,
  SwitchStateDTO,
} from '@text-based/home-assistant-shared';
import { is } from '@text-based/utilities';
import { Button, Card, Popconfirm, Radio, Spin } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tStateType = {
  friendly_name?: string;
  state?: string;
};

export class SwitchEntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate?: (state: RoomEntitySaveStateDTO) => void;
    selfContained?: boolean;
    state?: RoomEntitySaveStateDTO;
    title?: string;
  },
  tStateType
> {
  private get ref(): string {
    return this.props?.state?.ref;
  }

  override async componentDidMount(): Promise<void> {
    this.setState({
      state: this.props?.state?.state,
    });
    await this.refresh();
  }

  public getSaveState(): RoomEntitySaveStateDTO {
    return {
      ref: this.ref,
      state: this.state.state || 'off',
    };
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { friendly_name, state } = this.state;
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
        <Radio.Group value={state} onChange={this.onModeChange.bind(this)}>
          <Radio.Button value="off">Off</Radio.Button>
          <Radio.Button value="on">On</Radio.Button>
          <Radio.Button value="toggle">Toggle</Radio.Button>
        </Radio.Group>
      </Card>
    );
  }

  private async onModeChange(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const state = target.value;
    this.setState({ state });
    if (this.props.onUpdate) {
      this.props.onUpdate({ ref: this.ref, state });
    }
    if (this.props.selfContained) {
      const result = await sendRequest<SwitchStateDTO>(
        `/entity/command/${this.ref}/${state}`,
        {
          method: 'put',
        },
      );
      this.setState({ state: result.state });
    }
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
}
