// {
//   _id: "60456c84fb0a1bb2c6b1c348",
//   handler: ["after", "before"],
//   method: ["form", "create"],
//   priority: 0,
//   name: "resetpass",
//   title: "Reset Password",
//   settings: {
//     resources: ["6045267faf1db665e0de9327"],
//     username: "textField",
//     password: "textField",
//     url: "link_rul",
//     label: "Email Reset Password Link",
//     transport: "default",
//     from: "no-reply@form.io",
//     subject: "You requested a password reset",
//     message:
//       '<p>Forgot your password? No problem.</p><p><a href="{{ resetlink }}">Click here to reset your password</a></p> ',
//   },
//   condition: { eq: "", value: "", custom: "" },
//   form: "60455a95fb0a1bb5e9b1c329",
//   machineName: "formio:name:resetpass",
// }
export class ResetPasswordActionSettingsDTO {
  // #region Object Properties

  public from: string;
  public label: string;
  public message: string;
  public password: string;
  public resources: string[];
  public subject: string;
  public transport: string;
  public url: string;
  public username: string;

  // #endregion Object Properties
}
