import {
  RoutineCodeCommandDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';

import { TypedEditor } from '../../misc';

export function ExecuteCodeCommand(props: {
  command?: RoutineCommandDTO<RoutineCodeCommandDTO>;

  onUpdate: (command: Partial<RoutineCodeCommandDTO>) => void;
}) {
  return (
    <TypedEditor
      code={props.command?.command?.code ?? ''}
      type="execute"
      key={props.command?.id}
      onUpdate={code => props.onUpdate({ code })}
    />
  );
}
