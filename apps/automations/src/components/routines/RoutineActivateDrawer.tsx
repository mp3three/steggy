import {
  KunamiCodeActivateDTO,
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
} from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import {
  Button,
  Card,
  Drawer,
  Form,
  notification,
  Space,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import {
  RoutineActivateCron,
  RoutineActivateKunami,
  RoutineActivateSolar,
} from './activate';

type tState = {
  activate?: RoutineActivateDTO;
  name: string;
  visible?: boolean;
};

export class RoutineActivateDrawer extends React.Component<
  {
    activate?: RoutineActivateDTO;
    onUpdate?: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  private get type() {
    return this.state.activate.type;
  }
  override state = {} as tState;
  private widget:
    | RoutineActivateCron
    | RoutineActivateSolar
    | RoutineActivateKunami;

  override componentDidMount(): void {
    if (this.props.activate) {
      this.setState({
        activate: this.props.activate,
        name: this.props.activate.friendlyName,
      });
    }
  }

  public load(activate: Partial<RoutineActivateDTO>): void {
    this.setState({
      activate: activate as RoutineActivateDTO,
      name: activate.friendlyName,
      visible: true,
    });
  }

  override render() {
    if (!this.state.activate) {
      return (
        <Drawer visible={false}>
          <Spin />
        </Drawer>
      );
    }
    return (
      <Drawer
        visible={this.state.visible}
        onClose={() => this.setState({ visible: false })}
        size="large"
        title={
          <Typography.Text
            editable={{ onChange: name => this.setState({ name }) }}
          >
            {this.state.name}
          </Typography.Text>
        }
        extra={
          <Space>
            <Button type="primary" onClick={this.save.bind(this)}>
              Save
            </Button>
            <Button>Cancel</Button>
          </Space>
        }
      >
        <Card title="Activation event">
          <Form labelCol={{ span: 4 }}>{this.renderType()}</Form>
        </Card>
      </Drawer>
    );
  }

  private renderType() {
    if (this.type === 'schedule') {
      return (
        <RoutineActivateCron
          ref={i => (this.widget = i)}
          activate={this.state.activate.activate as ScheduleActivateDTO}
        />
      );
    }
    if (this.type === 'solar') {
      return (
        <RoutineActivateSolar
          ref={i => (this.widget = i)}
          activate={this.state.activate.activate as SolarActivateDTO}
        />
      );
    }
    if (this.type === 'kunami') {
      return (
        <RoutineActivateKunami
          ref={i => (this.widget = i)}
          activate={this.state.activate.activate as KunamiCodeActivateDTO}
        />
      );
    }
    return undefined;
  }

  private async save(): Promise<void> {
    const { id } = this.state.activate;
    const activate = this.widget.getValue();
    if (!activate) {
      notification.error({
        message: 'Invalid ',
      });
      return;
    }
    const routine = is.empty(id)
      ? await sendRequest<RoutineDTO>(
          `/routine/${this.props.routine._id}/activate`,
          {
            body: JSON.stringify({
              activate,
              friendlyName: this.state.name,
              type: this.state.activate.type,
            } as RoutineActivateDTO),
            method: 'post',
          },
        )
      : await sendRequest<RoutineDTO>(
          `/routine/${this.props.routine._id}/activate/${id}`,
          {
            body: JSON.stringify({
              activate,
              friendlyName: this.state.name,
              type: this.state.activate.type,
            } as RoutineActivateDTO),
            method: 'put',
          },
        );

    if (this.props.onUpdate) {
      this.props.onUpdate(routine);
    }
    this.setState({ visible: false });
  }
}
