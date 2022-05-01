import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { LightStateDTO, SwitchStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  notification,
  Popconfirm,
  Radio,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tStateType = {
  disabled?: boolean;
  friendly_name?: string;
  state?: string;
};

export class SwitchEntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate?: (state: GeneralSaveStateDTO) => void;
    optional?: boolean;
    selfContained?: boolean;
    state?: GeneralSaveStateDTO;
    stateOnly?: boolean;
    title?: string;
  },
  tStateType
> {
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
      state: this.props?.state?.state,
    });
    if (this.props.optional) {
      this.setState({
        disabled: is.undefined(this.props.state?.state),
      });
    }
    await this.refresh();
  }

  public getSaveState(): GeneralSaveStateDTO {
    if (this.disabled) {
      return undefined;
    }
    return {
      ref: this.ref,
      state: this.state.state || 'off',
    };
  }

  override render() {
    if (!this.state) {
      return this.renderWaiting();
    }
    const { friendly_name, state, disabled } = this.state;
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
          buttonStyle="solid"
          value={state}
          onChange={this.onModeChange.bind(this)}
          disabled={this.disabled}
        >
          <Radio.Button value="off">Off</Radio.Button>
          <Radio.Button value="on">On</Radio.Button>
          {this.props.stateOnly ? undefined : (
            <Radio.Button value="toggle">Toggle</Radio.Button>
          )}
        </Radio.Group>
      </Card>
    );
  }

  private async onModeChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const state = e.target.value;
    this.setState({ state });
    if (this.props.onUpdate) {
      this.props.onUpdate({ ref: this.ref, state });
    }
    if (this.props.selfContained) {
      const result = await sendRequest<SwitchStateDTO>({
        method: 'put',
        url: `/entity/command/${this.ref}/${state}`,
      });
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
    const entity = await sendRequest<LightStateDTO>({
      url: `/entity/id/${this.ref}`,
    });
    if (is.undefined(entity.attributes)) {
      notification.open({
        description: (
          <Typography>
            {`Server returned bad response. Verify that `}
            <Typography.Text code>{this.ref}</Typography.Text> still exists?
          </Typography>
        ),
        message: 'Entity not found',
        type: 'error',
      });
      return;
    }
    this.setState({ friendly_name: entity.attributes.friendly_name });
    if (this.props.selfContained) {
      this.setState({ state: entity.state });
    }
  }

  private renderWaiting() {
    return (
      <Card title={this.ref} type="inner">
        <Spin />
      </Card>
    );
  }
}
