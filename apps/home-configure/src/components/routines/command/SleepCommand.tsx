import { RoutineCommandSleepDTO } from '@steggy/controller-shared';
import { InputNumber } from 'antd';
import { useEffect, useState } from 'react';

export function SleepCommand(props: {
  command?: RoutineCommandSleepDTO;
  onUpdate: (command: Partial<RoutineCommandSleepDTO>) => void;
}) {
  const [duration, setDuration] = useState<number>();
  useEffect(() => {
    setDuration(props.command?.duration);
  }, [props.command?.duration]);

  return (
    <InputNumber
      value={duration}
      onChange={duration => setDuration(duration)}
      onBlur={() => props.onUpdate({ duration })}
      addonAfter="seconds"
    />
  );
}
