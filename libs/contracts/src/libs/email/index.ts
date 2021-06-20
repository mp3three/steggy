import { EmailActionSettingsDTO } from '../action';
import { SessionTokenDTO } from '../authentication';
import { SubmissionDTO, UserDTO } from '../formio-sdk';

export class NunjucksRenderDTO {
  // #region Object Properties

  public bcc: string;
  public cc: string;
  public from: string;
  public html: string;
  public messageTransport: string;
  public subject: string;
  public to: string;
  public transport: string;

  // #endregion Object Properties
}

export type NunjucksOptions = SubmissionDTO & {
  req: {
    user: UserDTO;
    token?: SessionTokenDTO;
    query: Record<string, string>;
    params: Record<string, string>;
    body: SubmissionDTO;
  };
  settings: EmailActionSettingsDTO;
  res?: {
    token?: string;
  };
};

export class NunjucksParametersDTO {
  // #region Object Properties

  public context: NunjucksOptions;
  public options: {
    params: NunjucksOptions;
  };
  public render: NunjucksRenderDTO;

  // #endregion Object Properties
}
