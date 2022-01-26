import { CloseOutlined } from '@ant-design/icons';
import { RoomEntitySaveStateDTO } from '@text-based/controller-shared';
import { HassStateDTO, LightStateDTO } from '@text-based/home-assistant-shared';
import { is } from '@text-based/utilities';
import { Button, Card, Popconfirm, Popover, Spin, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityAttributePopover } from './AttributePopover';

type tStateType = {
  friendly_name?: string;
  state?: string;
};

export class EntityCard extends React.Component<
  {
    onRemove?: (entity_id: string) => void;
    onUpdate: (state: RoomEntitySaveStateDTO) => void;
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
