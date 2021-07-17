// {
//   _id: "60456c47fb0a1b056ab1c346",
//   handler: ["after", "before"],
//   method: ["create", "update", "read", "delete", "index"],
//   priority: 0,
//   name: "email",
//   title: "Email",
//   settings: {
//     transport: "default",
//     from: "no-reply@form.io",
//     emails: ["to_address@test.com"],
//     sendEach: true,
//     cc: ["cc_address@test.com"],
//     bcc: ["bcc_address@test.com"],
//     subject: "New submission for {{ form.title }}.",
//     template: "https://pro.formview.io/assets/email.html",
//     message: "{{ submission(data, form.components) }}",
//     attachFiles: true,
//     attachPDF: true,
//     pdfName: "{{ form.name }}-{{ submission._id }}",
//   },
//   condition: { eq: "", value: "", custom: "" },
//   form: "60455a95fb0a1bb5e9b1c329",
//   machineName: "formio:name:email",

import { EmailConfig } from '../../../config';

// }
export class EmailActionSettingsDTO {
  // #region Object Properties

  public attachFiles: boolean;
  public attachPDF: boolean;
  public bcc: string[];
  public cc: string[];
  public emails: string[];
  public from: string;
  public message: string;
  /**
   * "{{ form.name }}-{{ submission._id }}"
   */
  public pdfName: string;
  public sendEach: boolean;
  public subject: string;
  public template: string;
  public transport: Omit<keyof EmailConfig, 'EMAIL_DEFAULT_FROM'> | 'default';

  // #endregion Object Properties
}
// {
//   "transport": "default",
//   "from": "from@test.com",
//   "emails": [
//     "to@test.com"
//   ],
//   "sendEach": true,
//   "cc": [
//     "cc@test.com"
//   ],
//   "bcc": [
//     "bcc@test.com"
//   ],
//   "subject": "New submission for {{ form.title }}.",
//   "template": "https://pro.formview.io/assets/email.html",
//   "message": "{{ submission(data, form.components) }}",
//   "attachFiles": true,
//   "attachPDF": true,
//   "pdfName": "{{ form.name }}-{{ submission._id }}"
// }
