import { PromptService, Repl, REPL_TYPE } from '@automagical/tty';

@Repl({
  name: 'Routines',
  type: REPL_TYPE.home,
})
export class RoutineCommandService {
  constructor(private readonly promptService: PromptService) {}
}
