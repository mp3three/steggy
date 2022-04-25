import { RoutineDTO } from '@steggy/controller-shared';
import { Button, Drawer } from 'antd';
import React from 'react';

import { RoutineListDetail } from './RoutineListDetail';

type tState = {
  visible?: boolean;
};

export class RoutineInspectButton extends React.Component<{
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}> {
  override state = {} as tState;

  override render() {
    return (
      <>
        <Button
          type={this.state.visible ? 'primary' : 'text'}
          onClick={() => this.setState({ visible: true })}
        >
          {this.props.routine?.friendlyName}
        </Button>
        <Drawer
          title="Routine Details"
          size="large"
          visible={this.state.visible}
          onClose={() => this.setState({ visible: false })}
        >
          <RoutineListDetail
            nested
            routine={this.props.routine}
            onUpdate={update => this.props.onUpdate(update)}
          />
        </Drawer>
      </>
    );
  }
}
