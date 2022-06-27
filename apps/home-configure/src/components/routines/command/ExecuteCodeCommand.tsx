import { RoutineCodeCommandDTO } from '@steggy/controller-shared';

import { TypedEditor } from '../../misc';

export function ExecuteCodeCommand(props: {
  command?: RoutineCodeCommandDTO;
  onUpdate: (command: Partial<RoutineCodeCommandDTO>) => void;
}) {
  return (
    <TypedEditor
      code={props.command?.code ?? ''}
      type="execute"
      onUpdate={code => props.onUpdate({ code })}
    />
  );
}
