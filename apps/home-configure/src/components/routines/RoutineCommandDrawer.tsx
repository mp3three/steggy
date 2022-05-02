import {
  GeneralSaveStateDTO,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
  RoutineCommandNodeRedDTO,
  RoutineCommandPersonStateDTO,
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

import { FD_ICONS, sendRequest } from '../../types';
import {
  EntityStateCommand,
  GroupActionCommand,
  GroupStateCommand,
  NodeRedCommand,
  PersonStateCommand,
  RoomStateCommand,
  SendNotificationCommand,
  SetRoomMetadataCommand,
  SleepCommand,
  StopProcessingCommand,
  TriggerRoutineCommand,
  WebhookCommand,
} from './command';

export function RoutineCommandDrawer(props: {
  command?: RoutineCommandDTO;
  onComplete: () => void;
  onUpdate: (command: Partial<RoutineCommandDTO>) => void;
  routine: RoutineDTO;
}) {
  const type = props.command?.type;

  function onUpdate(command): void {
    props.onUpdate({
      ...props.command,
      command: {
        ...props.command.command,
        ...command,
      },
    });
  }

  function renderType() {
    switch (type) {
      case 'stop_processing':
        return (
          <StopProcessingCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandStopProcessingDTO}
          />
        );
      case 'set_metadata':
        return (
          <SetRoomMetadataCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as SetRoomMetadataCommandDTO}
          />
        );
      case 'entity_state':
        return (
          <EntityStateCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as GeneralSaveStateDTO}
          />
        );
      case 'group_action':
        return (
          <GroupActionCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandGroupActionDTO}
          />
        );
      case 'node_red':
        return (
          <NodeRedCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandNodeRedDTO}
          />
        );
      case 'group_state':
        return (
          <GroupStateCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandGroupStateDTO}
          />
        );
      case 'room_state':
        return (
          <RoomStateCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandRoomStateDTO}
          />
        );
      case 'person_state':
        return (
          <PersonStateCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandPersonStateDTO}
          />
        );
      case 'send_notification':
        return (
          <SendNotificationCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandSendNotificationDTO}
          />
        );
      case 'sleep':
        return (
          <SleepCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandSleepDTO}
          />
        );
      case 'trigger_routine':
        return (
          <TriggerRoutineCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandTriggerRoutineDTO}
          />
        );
      case 'webhook':
        return (
          <WebhookCommand
            onUpdate={update => onUpdate(update)}
            command={props.command.command as RoutineCommandWebhookDTO}
          />
        );
    }
    return <Skeleton />;
  }

  async function testCommand(): Promise<void> {
    const { id } = props.command;
    if (!id) {
      notification.error({
        message: 'Save command first',
      });
      return;
    }
    await sendRequest({
      method: 'post',
      url: `/routine/${props.routine._id}/command/${id}`,
    });
  }

  if (!props.command) {
    return (
      <Drawer visible={false}>
        <Spin />
      </Drawer>
    );
  }
  return (
    <Drawer
      visible={is.object(props.command)}
      onClose={() => props.onComplete()}
      size="large"
      title={
        <Typography.Text
          editable={{
            onChange: friendlyName => props.onUpdate({ friendlyName }),
          }}
        >
          {props.command.friendlyName}
        </Typography.Text>
      }
      extra={
        <Space>
          <Button
            type="dashed"
            icon={FD_ICONS.get('run')}
            onClick={() => testCommand()}
            disabled={is.undefined(props?.command?.id)}
          >
            Test command
          </Button>
        </Space>
      }
    >
      <Card
        title={<Typography.Text strong>Command Action</Typography.Text>}
        type="inner"
      >
        <Form labelCol={{ span: 4 }}>{renderType()}</Form>
      </Card>
    </Drawer>
  );
}
