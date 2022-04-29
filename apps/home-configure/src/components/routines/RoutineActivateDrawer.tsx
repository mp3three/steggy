import {
  AttributeChangeActivateDTO,
  DeviceTriggerActivateDTO,
  InternalEventActivateDTO,
  MetadataChangeDTO,
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SequenceActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@steggy/controller-shared';
import { Card, Drawer, Form, Spin, Typography } from 'antd';

import { EntityHistory } from '../entities';
import {
  RoutineActivateAttributeChange,
  RoutineActivateCron,
  RoutineActivateDeviceTrigger,
  RoutineActivateInternalEvent,
  RoutineActivateKunami,
  RoutineActivateMetadataChange,
  RoutineActivateSolar,
  RoutineActivateStateChange,
} from './activate';

// eslint-disable-next-line radar/cognitive-complexity
export function RoutineActivateDrawer(props: {
  activate: RoutineActivateDTO;
  onComplete: () => void;
  onUpdate?: (routine: Partial<RoutineActivateDTO>) => void;
  routine: RoutineDTO;
}) {
  function renderType() {
    if (props.activate.type === 'attribute') {
      return (
        <RoutineActivateAttributeChange
          activate={props.activate.activate as AttributeChangeActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<AttributeChangeActivateDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'metadata') {
      return (
        <RoutineActivateMetadataChange
          activate={props.activate.activate as MetadataChangeDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<MetadataChangeDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'internal_event') {
      return (
        <RoutineActivateInternalEvent
          activate={props.activate.activate as InternalEventActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<InternalEventActivateDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'schedule') {
      return (
        <RoutineActivateCron
          activate={props.activate.activate as ScheduleActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<RoutineActivateDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'device_trigger') {
      return (
        <RoutineActivateDeviceTrigger
          activate={props.activate.activate as DeviceTriggerActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<DeviceTriggerActivateDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'state_change') {
      return (
        <RoutineActivateStateChange
          activate={props.activate.activate as StateChangeActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<StateChangeActivateDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'solar') {
      return (
        <RoutineActivateSolar
          activate={props.activate.activate as SolarActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<SolarActivateDTO>)
          }
        />
      );
    }
    if (props.activate.type === 'kunami') {
      return (
        <RoutineActivateKunami
          activate={props.activate.activate as SequenceActivateDTO}
          onUpdate={activate =>
            updateActivate(activate as Partial<SequenceActivateDTO>)
          }
        />
      );
    }
    return undefined;
  }

  function updateActivate(activate: Partial<ROUTINE_ACTIVATE_TYPES>): void {
    props.onUpdate({
      activate: {
        ...props.activate.activate,
        ...activate,
      },
    } as unknown as Partial<RoutineActivateDTO>);
  }

  if (!props.activate) {
    return (
      <Drawer visible={false}>
        <Spin />
      </Drawer>
    );
  }
  const activate = props.activate as RoutineActivateDTO<StateChangeActivateDTO>;
  return (
    <Drawer
      visible
      onClose={() => props.onComplete()}
      size="large"
      title={
        <Typography.Text
          editable={{
            onChange: friendlyName => props.onUpdate({ friendlyName }),
          }}
        >
          {props.activate.friendlyName}
        </Typography.Text>
      }
    >
      <Card type="inner" title="Activation Event">
        <Form labelCol={{ span: 4 }}>{renderType()}</Form>
      </Card>
      {props.activate.type === 'state_change' ? (
        <EntityHistory entity={activate.activate?.entity} />
      ) : undefined}
    </Drawer>
  );
}
