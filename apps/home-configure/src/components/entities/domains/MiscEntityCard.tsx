import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { HassStateDTO, LightStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  notification,
  Popconfirm,
  Popover,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { EntityAttributePopover } from '../AttributePopover';

type tStateType = {
  friendly_name?: string;
  state?: string;
};

export class EntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate: (state: GeneralSaveStateDTO) => void;
    state: HassStateDTO;
    title?: string;
  },
  tStateType
> {
  private get ref(): string {
    return this.props?.state?.entity_id;
  }

  override async componentDidMount(): Promise<void> {
    await this.refresh();
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
        <Popover content={<EntityAttributePopover state={this.props.state} />}>
          <Typography.Text>
            {is.object(state) ? JSON.stringify(state) : state}
          </Typography.Text>
        </Popover>
      </Card>
    );
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
