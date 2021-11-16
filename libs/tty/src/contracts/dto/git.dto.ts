export class GitConfigDTO {
  user: GitConfigUser;
}
export type GitConfigUser = Record<'name' | 'email', string>;
