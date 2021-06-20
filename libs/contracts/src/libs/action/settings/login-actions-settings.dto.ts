// {
//   resources: ["6045267faf1db665e0de9327"],
//   username: "textField",
//   password: "textField",
//   allowedAttempts: "5",
//   attemptWindow: "30",
//   lockWait: "1800",
// }
export class LoginActionSettingsDTO {
  // #region Object Properties

  public allowedAttempts: number;
  public attemptWindow: number;
  public lockWait: number;
  public password: string;
  public resources: string[];
  public username: string;

  // #endregion Object Properties
}
