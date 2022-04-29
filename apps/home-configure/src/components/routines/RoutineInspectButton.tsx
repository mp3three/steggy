import { RoutineDTO } from '@steggy/controller-shared';
import { Button, Drawer } from 'antd';
import React, { useState } from 'react';

import { RoutineExtraActions } from './RoutineExtraActions';
import { RoutineListDetail } from './RoutineListDetail';

export function RoutineInspectButton(props: {
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        type={visible ? 'primary' : 'text'}
        onClick={() => setVisible(true)}
      >
        {props.routine?.friendlyName}
      </Button>
      <Drawer
        title="Routine Details"
        size="large"
        extra={
          <RoutineExtraActions
            routine={props.routine}
            onUpdate={props.onUpdate}
          />
        }
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <RoutineListDetail
          nested
          routine={props.routine}
          onUpdate={update => props.onUpdate(update)}
        />
      </Drawer>
    </>
  );
}
