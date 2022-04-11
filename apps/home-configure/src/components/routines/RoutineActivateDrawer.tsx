import {
  MetadataChangeDTO,
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
  SequenceActivateDTO,
  SolarActivateDTO,
  StateChangeActivateDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Drawer, Form, Spin, Typography } from 'antd';
import React from 'react';

import { EntityHistory } from '../entities';
import {
  RoutineActivateCron,
  RoutineActivateKunami,
  RoutineActivateMetadataChange,
  RoutineActivateSolar,
  RoutineActivateStateChange,
} from './activate';

export class RoutineActivateDrawer extends React.Component<{
  activate: RoutineActivateDTO;
  onComplete: () => void;
  onUpdate?: (routine: Partial<RoutineActivateDTO>) => void;
  routine: RoutineDTO;
}> {
  override render() {
    if (!this.props.activate) {
      return (
        <Drawer visible={false}>
          <Spin />
        </Drawer>
      );
    }
    const activate = this.props
      .activate as RoutineActivateDTO<StateChangeActivateDTO>;
    return (
      <Drawer
        visible
        onClose={() => this.props.onComplete()}
        size="large"
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName => this.props.onUpdate({ friendlyName }),
            }}
          >
            {this.props.activate.friendlyName}
          </Typography.Text>
        }
      >
        <Card type="inner" title="Activation Event">
          <Form labelCol={{ span: 4 }}>{this.renderType()}</Form>
        </Card>
        {this.props.activate.type === 'state_change' ? (
          <EntityHistory entity={activate.activate?.entity} />
        ) : undefined}
      </Drawer>
    );
  }

  private renderType() {
    if (this.props.activate.type === 'room_metadata') {
      return (
        <RoutineActivateMetadataChange
          activate={this.props.activate.activate as MetadataChangeDTO}
          onUpdate={activate =>
            this.updateActivate(activate as Partial<MetadataChangeDTO>)
          }
        />
      );
    }
    if (this.props.activate.type === 'schedule') {
      return (
        <RoutineActivateCron
          activate={this.props.activate.activate as ScheduleActivateDTO}
          onUpdate={activate =>
            this.updateActivate(activate as Partial<RoutineActivateDTO>)
          }
        />
      );
    }
    if (this.props.activate.type === 'state_change') {
      return (
        <RoutineActivateStateChange
          activate={this.props.activate.activate as StateChangeActivateDTO}
          onUpdate={activate =>
            this.updateActivate(activate as Partial<StateChangeActivateDTO>)
          }
        />
      );
    }
    if (this.props.activate.type === 'solar') {
      return (
        <RoutineActivateSolar
          activate={this.props.activate.activate as SolarActivateDTO}
          onUpdate={activate =>
            this.updateActivate(activate as Partial<SolarActivateDTO>)
          }
        />
      );
    }
    if (this.props.activate.type === 'kunami') {
      return (
        <RoutineActivateKunami
          activate={this.props.activate.activate as SequenceActivateDTO}
          onUpdate={activate =>
            this.updateActivate(activate as Partial<SequenceActivateDTO>)
          }
        />
      );
    }
    return undefined;
  }

  private updateActivate(activate: Partial<ROUTINE_ACTIVATE_TYPES>): void {
    const historyEntity = (activate as StateChangeActivateDTO).entity;
    if (!is.empty(historyEntity)) {
      this.setState({ historyEntity });
    }
    this.props.onUpdate({
      activate: {
        ...this.props.activate.activate,
        ...activate,
      },
    } as unknown as Partial<RoutineActivateDTO>);
  }
}
