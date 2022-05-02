import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Drawer, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { RoutineExtraActions } from './RoutineExtraActions';
import { RoutineListDetail } from './RoutineListDetail';

export function RoutineInspectButton(props: {
  onUpdate?: (routine: RoutineDTO) => void;
  routine: RoutineDTO | string;
}) {
  const [visible, setVisible] = useState(false);
  const [routine, setRoutine] = useState<RoutineDTO>();

  async function load(visible?: boolean): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      url: `/routine/${
        is.string(props.routine) ? props.routine : props.routine._id
      }`,
    });
    if (props.onUpdate) {
      props.onUpdate(routine);
    }
    setRoutine(routine);
    if (visible) {
      setVisible(true);
    }
  }

  useEffect(() => {
    if (is.string(props.routine)) {
      load();
      return;
    }
    setRoutine(props.routine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.routine]);

  function onUpdate(update: RoutineDTO) {
    setRoutine({
      ...routine,
      ...update,
    });
    if (props.onUpdate) {
      props.onUpdate(update);
    }
  }

  const ACTIVATE_BUTTON = (
    <Button
      size="small"
      type={visible ? 'primary' : 'text'}
      onClick={() => setVisible(true)}
    >
      {routine?.friendlyName}
    </Button>
  );

  return (
    <>
      <Drawer
        title={<Typography.Text strong>Routine details</Typography.Text>}
        size="large"
        extra={
          <RoutineExtraActions
            routine={routine}
            onUpdate={update => onUpdate(update)}
          />
        }
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <RoutineListDetail
          nested
          routine={routine}
          onUpdate={update => onUpdate(update)}
        />
      </Drawer>
      {is.empty(routine.description) ? (
        ACTIVATE_BUTTON
      ) : (
        <Tooltip title={routine.description}>{ACTIVATE_BUTTON}</Tooltip>
      )}
    </>
  );
}
