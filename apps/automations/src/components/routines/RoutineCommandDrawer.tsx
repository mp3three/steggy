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
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
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
import {
  EntityStateCommand,
  GroupActionCommand,
  GroupStateCommand,
  RoomStateCommand,
  SendNotificationCommand,
  SleepCommand,
  TriggerRoutineCommand,
} from './command';

type tState = {
  command?: RoutineCommandDTO;
  name: string;
  visible?: boolean;
};

export class RoutineCommandDrawer extends React.Component<
  {
    command?: RoutineCommandDTO;
    onUpdate?: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  private get type() {
    return this.state.command.type;
  }

  override state = {} as tState;
  private widget:
    | EntityStateCommand
    | GroupActionCommand
    | GroupStateCommand
    | RoomStateCommand
    | SendNotificationCommand
    | SleepCommand
    | TriggerRoutineCommand;

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
    setTimeout(() => {
      // FIXME: I'm lazy with types
      // @ts-expect-error See above
      this.widget.load(command.command);
    }, 0);
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
        <Card title="Command action">
          <Form labelCol={{ span: 4 }}>{this.renderType()}</Form>
        </Card>
      </Drawer>
    );
  }

  private renderType() {
    switch (this.type) {
      case 'entity_state':
        return (
          <EntityStateCommand
            ref={i => (this.widget = i)}
            command={this.state.command.command as RoomEntitySaveStateDTO}
          />
        );
      case 'group_action':
        return (
          <GroupActionCommand
            ref={i => (this.widget = i)}
            command={this.state.command.command as RoutineCommandGroupActionDTO}
          />
        );
      case 'group_state':
        return (
          <GroupStateCommand
            ref={i => (this.widget = i)}
            command={this.state.command.command as RoutineCommandGroupStateDTO}
          />
        );
      case 'room_state':
        return (
          <RoomStateCommand
            ref={i => (this.widget = i)}
            command={this.state.command.command as RoutineCommandRoomStateDTO}
          />
        );
      case 'send_notification':
        return (
          <SendNotificationCommand
            ref={i => (this.widget = i)}
            command={
              this.state.command.command as RoutineCommandSendNotificationDTO
            }
          />
        );
      case 'sleep':
        return (
          <SleepCommand
            ref={i => (this.widget = i)}
            command={this.state.command.command as RoutineCommandSleepDTO}
          />
        );
      case 'trigger_routine':
        return (
          <TriggerRoutineCommand
            ref={i => (this.widget = i)}
            command={
              this.state.command.command as RoutineCommandTriggerRoutineDTO
            }
          />
        );
    }
    return undefined;
  }

  private async save(): Promise<void> {
    const { id } = this.state.command;
    const command = this.widget.getValue();
    if (!command) {
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
              type: this.state.command.type,
            } as RoutineCommandDTO),
            method: 'post',
          },
        )
      : await sendRequest<RoutineDTO>(
          `/routine/${this.props.routine._id}/command/${id}`,
          {
            body: JSON.stringify({
              command,
              friendlyName: this.state.name,
              type: this.state.command.type,
            } as RoutineCommandDTO),
            method: 'put',
          },
        );

    if (this.props.onUpdate) {
      this.props.onUpdate(routine);
    }
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
