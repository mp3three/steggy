import type { ResultControlDTO } from '../libs/fetch';
import type { TokenDTO } from '../libs/formio-sdk';

export interface TokenCRUD {
  // #region Public Methods

  create(Token: TokenDTO): Promise<TokenDTO>;
  delete(Token: TokenDTO | string): Promise<boolean>;
  findById(Token: string, control: ResultControlDTO): Promise<TokenDTO>;
  findMany(query: ResultControlDTO): Promise<TokenDTO[]>;
  update(source: TokenDTO): Promise<TokenDTO>;

  // #endregion Public Methods
}
export const TokenCRUD = Symbol('TokenCRUD');
export type iTokenCRUD = TokenCRUD;
