import DebugStepInto from '@2fd/ant-design-icons/lib/DebugStepInto';
import {
  RoomEntitySaveStateDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandNodeRedDTO,
  RoutineCommandRoomStateDTO,
  RoutineCommandSendNotificationDTO,
  RoutineCommandSleepDTO,
  RoutineCommandStopProcessingDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineCommandWebhookDTO,
  RoutineDTO,
  SetRoomMetadataCommandDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
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
  NodeRedCommand,
  RoomStateCommand,
  SendNotificationCommand,
  SleepCommand,
  StopProcessingCommand,
  TriggerRoutineCommand,
} from './command';
import { SetRoomMetadataCommand } from './command/SetRoomMetadata';
import { WebhookCommand } from './command/WebhookCommand';

export class RoutineCommandDrawer extends React.Component<{
  command?: RoutineCommandDTO;
  onComplete: () => void;
  onUpdate: (command: Partial<RoutineCommandDTO>) => void;
  routine: RoutineDTO;
}> {
  private get type() {
    return this.props.command.type;
  }

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
    if (!this.props.command) {
      return (
        <Drawer visible={false}>
          <Spin />
        </Drawer>
      );
    }
    return (
      <Drawer
        visible={is.object(this.props.command)}
        onClose={() => this.props.onComplete()}
        size="large"
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName => this.props.onUpdate({ friendlyName }),
            }}
          >
            {this.props.command.friendlyName}
          </Typography.Text>
        }
        extra={
          <Space>
            <Button
              type="dashed"
              icon={<DebugStepInto />}
              onClick={this.testCommand.bind(this)}
              disabled={is.undefined(this.props?.command?.id)}
            >
              Test command
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
    this.props.onUpdate({
      ...this.props.command,
      command: {
        ...this.props.command.command,
        ...command,
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
              this.props.command.command as RoutineCommandStopProcessingDTO
            }
          />
        );
      case 'set_room_metadata':
        return (
          <SetRoomMetadataCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as SetRoomMetadataCommandDTO}
          />
        );
      case 'entity_state':
        return (
          <EntityStateCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoomEntitySaveStateDTO}
          />
        );
      case 'group_action':
        return (
          <GroupActionCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoutineCommandGroupActionDTO}
          />
        );
      case 'node_red':
        return (
          <NodeRedCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoutineCommandNodeRedDTO}
          />
        );
      case 'group_state':
        return (
          <GroupStateCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoutineCommandGroupStateDTO}
          />
        );
      case 'room_state':
        return (
          <RoomStateCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoutineCommandRoomStateDTO}
          />
        );
      case 'send_notification':
        return (
          <SendNotificationCommand
            onUpdate={this.onUpdate.bind(this)}
            command={
              this.props.command.command as RoutineCommandSendNotificationDTO
            }
          />
        );
      case 'sleep':
        return (
          <SleepCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoutineCommandSleepDTO}
          />
        );
      case 'trigger_routine':
        return (
          <TriggerRoutineCommand
            onUpdate={this.onUpdate.bind(this)}
            command={
              this.props.command.command as RoutineCommandTriggerRoutineDTO
            }
          />
        );
      case 'webhook':
        return (
          <WebhookCommand
            onUpdate={this.onUpdate.bind(this)}
            command={this.props.command.command as RoutineCommandWebhookDTO}
          />
        );
    }
    return <Skeleton />;
  }

  private async testCommand(): Promise<void> {
    const { id } = this.props.command;
    if (!id) {
      notification.error({
        message: 'Save command first',
      });
      return;
    }
    await sendRequest({
      method: 'post',
      url: `/routine/${this.props.routine._id}/command/${id}`,
    });
  }
}
