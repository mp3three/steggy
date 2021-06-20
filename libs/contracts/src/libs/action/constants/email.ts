import { SubmissionActionInfoDTO } from '@automagical/contracts/action';
import {
  BaseComponentDTO,
  ButtonComponentDTO,
  CheckboxComponentDTO,
  ColumnsComponentDTO,
  ContainerComponentDTO,
  EmailComponentDTO,
  FieldSetComponentDTO,
  HiddenComponentDTO,
  HtmlElementComponentDTO,
  PasswordComponentDTO,
  SelectComponentDTO,
  TextAreaComponentDTO,
  TextFieldComponentDTO,
  WellComponentDTO,
} from '@automagical/contracts/components';
import {
  ACTION_NAMES,
  FormDTO,
  HANDLERS,
  ProjectDTO,
} from '@automagical/contracts/formio-sdk';
import { ACTION_METHOD } from '@automagical/contracts/server';

/* eslint-disable radar/no-duplicate-string */

export const AVAILABLE_TRANSPORTS = [];
export const DEFAULT_EMAIL = '';
export const EMAIL_INFO: SubmissionActionInfoDTO = {
  defaults: {
    handler: [HANDLERS.after],
    method: [ACTION_METHOD.create],
    name: ACTION_NAMES.email,
    priority: 0,
    title: 'Email',
  },
  description: 'Allows you to email people on submission.',
  name: ACTION_NAMES.email,
  priority: 0,
  title: 'Email',
};

export const EMAIL_SETTINGS = (
  project: ProjectDTO,
  form: FormDTO,
): { action: string; components: BaseComponentDTO[] } => {
  return {
    action: `/project/${project._id}/form/${form._id}/action`,
    components: [
      {
        input: true,
        key: 'priority',
        type: 'hidden',
      } as HiddenComponentDTO,
      {
        input: true,
        key: 'name',
        type: 'hidden',
      } as HiddenComponentDTO,
      {
        input: true,
        key: 'title',
        label: 'Title',
        type: 'textfield',
      } as TextFieldComponentDTO,
      {
        components: [
          {
            components: [
              {
                data: {
                  json: '[{"transport":"default","title":"Default (charges may apply)"}]',
                },
                dataSrc: 'json',
                defaultValue: 'default',
                input: true,
                key: 'transport',
                label: 'Transport',
                multiple: false,
                placeholder: 'Select the email transport.',
                template: '<span>{{ item.title }}</span>',
                type: 'select',
                validate: {
                  required: true,
                },
                valueProperty: 'transport',
              } as SelectComponentDTO,
              {
                input: true,
                inputType: 'text',
                key: 'from',
                label: 'From:',
                multiple: false,
                placeholder: 'Send the email from the following address',
                type: 'textfield',
              } as TextFieldComponentDTO,
              {
                defaultValue: '',
                input: true,
                inputType: 'text',
                key: 'emails',
                label: 'To: Email Address',
                multiple: true,
                placeholder: 'Send to the following email',
                type: 'textfield',
                validate: {
                  required: true,
                },
              } as TextFieldComponentDTO,
              {
                input: true,
                key: 'sendEach',
                label: 'Send a separate email to each recipient',
                type: 'checkbox',
              } as CheckboxComponentDTO,
              {
                defaultValue: '',
                input: true,
                inputType: 'text',
                key: 'cc',
                label: 'Cc: Email Address',
                multiple: true,
                placeholder: 'Send copy of the email to the following email',
                type: 'textfield',
              } as TextFieldComponentDTO,
              {
                defaultValue: '',
                input: true,
                inputType: 'text',
                key: 'bcc',
                label: 'Bcc: Email Address',
                multiple: true,
                placeholder:
                  'Send blink copy of the email to the following email (other recipients will not see this)',
                type: 'textfield',
              } as TextFieldComponentDTO,
              {
                defaultValue: 'New submission for {{ form.title }}.',
                input: true,
                inputType: 'text',
                key: 'subject',
                label: 'Subject',
                multiple: false,
                placeholder: 'Email subject',
                type: 'textfield',
              } as TextFieldComponentDTO,
              {
                defaultValue: 'https://pro.formview.io/assets/email.html',
                inputType: 'text',
                key: 'template',
                label: 'Email Template URL',
                multiple: false,
                placeholder: 'Enter a URL for your external email template.',
                type: 'textfield',
              } as TextFieldComponentDTO,
              {
                defaultValue: '{{ submission(data, form.components) }}',
                input: true,
                key: 'message',
                label: 'Message',
                multiple: false,
                placeholder: 'Enter the message you would like to send.',
                rows: 3,
                type: 'textarea',
              } as TextAreaComponentDTO,
              {
                input: true,
                key: 'attachFiles',
                label: 'Attach Submission Files',
                tooltip:
                  'Check this if you would like to attach submission files to the email.',
                type: 'checkbox',
              } as CheckboxComponentDTO,
              {
                input: true,
                key: 'attachPDF',
                label: 'Attach Submission PDF',
                tooltip:
                  'Check this if you would like to attach a PDF of the submission to the email. This will count toward your PDF Submission count for every email sent.',
                type: 'checkbox',
              } as CheckboxComponentDTO,
              {
                customConditional: 'show = !!data.settings.attachPDF;',
                defaultValue: '{{ form.name }}-{{ submission._id }}',
                input: true,
                key: 'pdfName',
                label: 'PDF File Name',
                tooltip:
                  'Determines how the submission PDF is named when it is attached.',
                type: 'textfield',
              } as TextFieldComponentDTO,
            ],
            input: false,
            key: 'settings',
            type: 'container',
          } as ContainerComponentDTO,
        ],
        input: false,
        legend: 'Action Settings',
        tree: true,
        type: 'fieldset',
      } as FieldSetComponentDTO,
      {
        components: [
          {
            data: {
              json: '[{"name":"before","title":"Before"},{"name":"after","title":"After"}]',
            },
            dataSrc: 'json',
            input: true,
            key: 'handler',
            label: 'Handler',
            multiple: true,
            placeholder: 'Select which handler(s) you would like to trigger',
            template: '<span>{{ item.title }}</span>',
            type: 'select',
            valueProperty: 'name',
          } as SelectComponentDTO,
          {
            data: {
              json: '[{"name":"create","title":"Create"},{"name":"update","title":"Update"},{"name":"read","title":"Read"},{"name":"delete","title":"Delete"},{"name":"index","title":"Index"}]',
            },
            dataSrc: 'json',
            input: true,
            key: 'method',
            label: 'Methods',
            multiple: true,
            placeholder: 'Trigger action on method(s)',
            template: '<span>{{ item.title }}</span>',
            type: 'select',
            valueProperty: 'name',
          } as SelectComponentDTO,
        ],
        input: false,
        key: 'conditions',
        legend: 'Action Execution',
        tree: false,
        type: 'fieldset',
      } as FieldSetComponentDTO,
      {
        components: [
          {
            components: [
              {
                columns: [
                  {
                    components: [
                      {
                        data: {
                          json: '[{"key":""},{"type":"email","unique":true,"required":true,"placeholder":"Enter your email address","key":"email","label":"Email","tableView":true,"input":true},{"type":"password","protected":true,"placeholder":"Enter your password.","key":"password","label":"Password","inputType":"password","tableView":false,"input":true},{"type":"button","disableOnInvalid":true,"key":"submit","tableView":false,"label":"Submit","input":true}]',
                        },
                        dataSrc: 'json',
                        input: true,
                        key: 'field',
                        label: 'Trigger this action only if field',
                        multiple: false,
                        placeholder: 'Select the conditional field',
                        template: '<span>{{ item.label || item.key }}</span>',
                        type: 'select',
                        valueProperty: 'key',
                      } as SelectComponentDTO,
                      {
                        data: {
                          json: '',
                          resource: '',
                          url: '',
                          values: [
                            {
                              label: '',
                              value: '',
                            },
                            {
                              label: 'Equals',
                              value: 'equals',
                            },
                            {
                              label: 'Does Not Equal',
                              value: 'notEqual',
                            },
                          ],
                        },
                        dataSrc: 'values',
                        input: true,
                        key: 'eq',
                        label: '',
                        multiple: false,
                        placeholder: 'Select comparison',
                        template: '<span>{{ item.label }}</span>',
                        type: 'select',
                        valueProperty: 'value',
                      } as SelectComponentDTO,
                      {
                        input: true,
                        inputType: 'text',
                        key: 'value',
                        label: '',
                        multiple: false,
                        placeholder: 'Enter value',
                        type: 'textfield',
                      } as TextFieldComponentDTO,
                    ],
                  },
                  {
                    components: [
                      {
                        components: [
                          {
                            className: '',
                            content:
                              'Or you can provide your own custom JavaScript or <a href="http://jsonlogic.com" target="_blank">JSON</a> condition logic here',
                            input: false,
                            key: 'html',
                            tag: 'h4',
                            type: 'htmlelement',
                          } as HtmlElementComponentDTO,
                          {
                            editorComponents: [
                              {
                                input: true,
                                key: 'email',
                                label: 'Email',
                                placeholder: 'Enter your email address',
                                required: true,
                                tableView: true,
                                type: 'email',
                                unique: true,
                              } as EmailComponentDTO,
                              {
                                input: true,
                                inputType: 'password',
                                key: 'password',
                                label: 'Password',
                                placeholder: 'Enter your password.',
                                protected: true,
                                tableView: false,
                                type: 'password',
                              } as PasswordComponentDTO,
                              {
                                disableOnInvalid: true,
                                input: true,
                                key: 'submit',
                                label: 'Submit',
                                tableView: false,
                                type: 'button',
                              } as ButtonComponentDTO,
                            ],
                            input: true,
                            key: 'custom',
                            label: '',
                            placeholder:
                              '// Example: Only execute if submitted roles has \'authenticated\'.\nJavaScript: execute = (data.roles.indexOf(\'authenticated\') !== -1);\nJSON: { "in": [ "authenticated", { "var": "data.roles" } ] }',
                            type: 'textarea',
                          } as TextAreaComponentDTO,
                        ],
                        input: false,
                        key: 'well2',
                        type: 'well',
                      } as WellComponentDTO,
                    ],
                  },
                ],
                input: false,
                key: 'columns',
                type: 'columns',
              } as ColumnsComponentDTO,
            ],
            input: false,
            key: 'condition',
            tree: true,
            type: 'container',
          } as ContainerComponentDTO,
        ],
        input: false,
        key: 'fieldset',
        legend: 'Action Conditions (optional)',
        tree: false,
        type: 'fieldset',
      } as FieldSetComponentDTO,
      {
        className: '',
        content: '',
        input: false,
        key: 'html2',
        tag: 'hr',
        type: 'htmlelement',
      } as HtmlElementComponentDTO,
      {
        action: 'submit',
        block: false,
        disableOnInvalid: true,
        input: true,
        key: 'submit',
        label: 'Save Action',
        leftIcon: '',
        rightIcon: '',
        size: 'md',
        theme: 'primary',
        type: 'button',
      } as ButtonComponentDTO,
    ],
  };
};
