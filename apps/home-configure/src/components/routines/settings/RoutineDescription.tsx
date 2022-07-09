import { RoutineDTO } from '@steggy/controller-shared';
import { Divider, Input } from 'antd';
import { useEffect, useState } from 'react';

export function RoutineDescription(props: {
  onUpdate: (routine: Partial<RoutineDTO>) => void;
  routine: RoutineDTO;
}) {
  const [description, setDescription] = useState('');

  function updateDescription() {
    props.onUpdate({ description });
  }

  useEffect(() => {
    setDescription(props.routine.description);
  }, [props.routine.description, props.routine._id]);

  return (
    <>
      <Divider orientation="left">Description</Divider>
      <Input.TextArea
        value={description}
        placeholder="Long form text description for personal use."
        onChange={({ target }) => setDescription(target.value)}
        onBlur={() => updateDescription()}
        style={{ minHeight: '150px' }}
      />
    </>
  );
}
