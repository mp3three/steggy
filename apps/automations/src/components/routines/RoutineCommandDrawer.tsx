import Cancel from '@2fd/ant-design-icons/lib/Cancel';
import ContentSave from '@2fd/ant-design-icons/lib/ContentSave';
import DebugStepInto from '@2fd/ant-design-icons/lib/DebugStepInto';
import {
  RoomEntitySaveStateDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandSleepDTO,
  RoutineCommandStopProcessingDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
} from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import {
  Button,
  Card,
  Drawer,
  Form,
  notification,
  Skeleton,
  Space,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import {
  EntityStateCommand,
  GroupActionCommand,
  GroupStateCommand,
  RoomStateCommand,
  SendNotificationCommand,
  SleepCommand,
  StopProcessingCommand,
  TriggerRoutineCommand,
} from './command';
import { WebhookCommand } from './command/WebhookCommand';

type tState = {
  command?: RoutineCommandDTO;
  name: string;
  visible?: boolean;
};

export class RoutineCommandDrawer extends React.Component<
  {
    command?: RoutineCommandDTO;
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  private get type() {
    return this.state.command.type;
  }

  override state = {} as tState;

  override componentDidMount(): void {
    if (this.props.command) {
      this.setState({
        command: this.props.command,
        name: this.props.command.friendlyName,
      });
    }
  }

  public load(command: Partial<RoutineCommandDTO>): void {
    this.setState({
      command: command as RoutineCommandDTO,
      name: command.friendlyName,
      visible: true,
    });
  }

  override render() {
    if (!this.state.command) {
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
            <Button
              type="dashed"
              icon={<DebugStepInto />}
              onClick={this.testCommand.bind(this)}
              disabled={is.undefined(this.state?.command?.id)}
            >
              Test command
            </Button>
            <Button
              type="primary"
              onClick={this.save.bind(this)}
              icon={<ContentSave />}
            >
              Save
            </Button>
            <Button
              icon={<Cancel />}
              onClick={() => this.setState({ visible: false })}
            >
              Cancel
            </Button>
          </Space>
        }
      >
        <Card title="Command Action" type="inner">
          <Form labelCol={{ span: 4 }}>{this.renderType()}</Form>
        </Card>
      </Drawer>
    );
  }

  private onUpdate(command): void {
    this.setState({
      command: {
        ...this.state.command,
        command: {
          ...this.state.command.command,
          ...command,
        },
      },
    });
  }

  private renderType() {
    switch (this.type) {
      case 'stop_processing':
        return (
          <StopProcessingCommand
            onUpdate={this.onUpdate.bind(this)}
            command={
              this.state.command.command as RoutineCommandStopProcessingDTO
            }
          />
        );
      case 'entity_state':
        return (
          <EntityStateCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.state.command.command as RoomEntitySaveStateDTO}
          />
        );
      case 'group_action':
        return (
          <GroupActionCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.state.command.command as RoutineCommandGroupActionDTO}
          />
        );
      case 'group_state':
        return (
          <GroupStateCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.state.command.command as RoutineCommandGroupStateDTO}
          />
        );
      case 'room_state':
        return (
          <RoomStateCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.state.command.command as RoutineCommandRoomStateDTO}
          />
        );
      case 'send_notification':
        return (
          <SendNotificationCommand
            onUpdate={this.onUpdate.bind(this)}
            command={
              this.state.command.command as RoutineCommandSendNotificationDTO
            }
          />
        );
      case 'sleep':
        return (
          <SleepCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.state.command.command as RoutineCommandSleepDTO}
          />
        );
      case 'trigger_routine':
        return (
          <TriggerRoutineCommand
            onUpdate={this.onUpdate.bind(this)}
            command={
              this.state.command.command as RoutineCommandTriggerRoutineDTO
            }
          />
        );
      case 'webhook':
        return (
          <WebhookCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.state.command.command as RoutineCommandWebhookDTO}
          />
        );
    }
    return <Skeleton />;
  }

  private async save(): Promise<void> {
    const { id, type, command } = this.state.command;
    if (!this.state.command) {
      notification.error({
        message: 'Invalid ',
      });
      return;
    }
    const routine = is.empty(id)
      ? await sendRequest<RoutineDTO>(
          `/routine/${this.props.routine._id}/command`,
          {
            body: JSON.stringify({
              command,
              friendlyName: this.state.name,
              type,
            }),
            method: 'post',
          },
        )
      : await sendRequest<RoutineDTO>(
          `/routine/${this.props.routine._id}/command/${id}`,
          {
            body: JSON.stringify({
              command,
              friendlyName: this.state.name,
              id,
              type,
            }),
            method: 'put',
          },
        );

    this.props.onUpdate(routine);
    this.setState({ visible: false });
  }

  private async testCommand(): Promise<void> {
    const { id } = this.state.command;
    if (!id) {
      notification.error({
        message: 'Save command first',
      });
      return;
    }
    await sendRequest(`/routine/${this.props.routine._id}/command/${id}`, {
      method: 'post',
    });
  }
}
