import {
  KunamiCodeActivateDTO,
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
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
import { EntityHistory } from '../entities';
import {
  RoutineActivateCron,
  RoutineActivateKunami,
  RoutineActivateSolar,
  RoutineActivateStateChange,
} from './activate';

type tState = {
  activate?: RoutineActivateDTO;
  historyEntity?: string;
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
    | RoutineActivateStateChange
    | RoutineActivateKunami;

  override componentDidMount(): void {
    if (this.props.activate) {
      if (this.props.activate.type === 'state_change') {
        const { activate } = this.props
          .activate as RoutineActivateDTO<StateChangeActivateDTO>;
        this.setState({
          historyEntity: activate?.entity,
        });
      }
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
    if (activate.type === 'state_change') {
      this.setState({
        historyEntity: (activate as RoutineActivateDTO<StateChangeActivateDTO>)
          .activate?.entity,
      });
    }
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
        <Card type="inner" title="Activation Event">
          <Form labelCol={{ span: 4 }}>{this.renderType()}</Form>
        </Card>
        {this.type === 'state_change' ? (
          <EntityHistory entity={this.state.historyEntity} />
        ) : undefined}
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
    if (this.type === 'state_change') {
      return (
        <RoutineActivateStateChange
          ref={i => (this.widget = i)}
          entityUpdate={historyEntity => this.setState({ historyEntity })}
          activate={this.state.activate.activate as StateChangeActivateDTO}
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
