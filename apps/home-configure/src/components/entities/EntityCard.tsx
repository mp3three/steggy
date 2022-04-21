import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { LightStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  notification,
  Popconfirm,
  Radio,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tStateType = {
  friendly_name?: string;
  state?: string;
};

export class EntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate: (state: GeneralSaveStateDTO) => void;
    state: GeneralSaveStateDTO;
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

  public getSaveState(): GeneralSaveStateDTO {
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
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
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
          value={state}
          onChange={this.onModeChange.bind(this)}
          buttonStyle="solid"
        >
          <Radio.Button value="off">Off</Radio.Button>
          <Radio.Button value="on">On</Radio.Button>
          <Radio.Button value="toggle">Toggle</Radio.Button>
        </Radio.Group>
      </Card>
    );
  }

  private onModeChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const state = e.target.value;
    this.setState({ state });
    this.props.onUpdate({ ref: this.ref, state });
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
  }

  private renderWaiting() {
    return (
      <Card title={this.ref} type="inner">
        <Spin />
      </Card>
    );
  }
}
