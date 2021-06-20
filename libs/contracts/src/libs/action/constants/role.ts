/* eslint-disable radar/no-duplicate-string */

import {
  ButtonComponentDTO,
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
  ProjectDTO,
  RoleDTO,
} from '@automagical/contracts/formio-sdk';

export const ROLE_INFO = {
  access: { handler: false, method: false },
  defaults: {
    handler: ['after'],
    method: ['create'],
    name: 'role',
    priority: 1,
    title: 'Role Assignment',
  },
  description: 'Provides the Role Assignment capabilities.',
  name: ACTION_NAMES.role,
  priority: 1,
  title: 'Role Assignment',
};

export const ROLE_SETTINGS_FORM = (
  form: FormDTO,
  project: ProjectDTO,
  roles: RoleDTO[],
): Record<string, unknown> => {
  return {
    action: `/project/${project._id}/form/${form._id}/action`,
    components: [
      { input: true, key: 'priority', type: 'hidden' } as HiddenComponentDTO,
      { input: true, key: 'name', type: 'hidden' } as HiddenComponentDTO,
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
                  json: '[{"association":"existing","title":"Existing Resource"},{"association":"new","title":"New Resource"}]',
                },
                dataSrc: 'json',
                input: true,
                key: 'association',
                label: 'Resource Association',
                multiple: false,
                placeholder:
                  'Select the type of resource to perform role manipulation.',
                template: '<span>{{ item.title }}</span>',
                type: 'select',
                validate: { required: true },
                valueProperty: 'association',
              } as SelectComponentDTO,
              {
                data: {
                  json: '[{"type":"add","title":"Add Role"},{"type":"remove","title":"Remove Role"}]',
                },
                dataSrc: 'json',
                input: true,
                key: 'type',
                label: 'Action Type',
                multiple: false,
                placeholder:
                  'Select whether this Action will Add or Remove the contained Role.',
                template: '<span>{{ item.title }}</span>',
                type: 'select',
                validate: { required: true },
                valueProperty: 'type',
              } as SelectComponentDTO,
              {
                data: {
                  json: roles,
                },
                dataSrc: 'json',
                input: true,
                key: 'role',
                label: 'Role',
                multiple: false,
                placeholder:
                  'Select the Role that this action will Add or Remove.',
                template: '<span>{{ item.title }}</span>',
                type: 'select',
                validate: { required: true },
                valueProperty: '_id',
              } as SelectComponentDTO,
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
                          json: '[{"key":""},{"input":true,"tableView":true,"inputType":"email","label":"Email","key":"email","placeholder":"Enter your user email","prefix":"","suffix":"","defaultValue":"","protected":false,"unique":false,"persistent":true,"type":"email","conditional":{"show":false,"when":null,"eq":""},"validate":{"required":true}},{"input":true,"tableView":false,"inputType":"password","label":"Password","key":"password","placeholder":"Enter your new password","prefix":"","suffix":"","protected":true,"persistent":true,"type":"password","conditional":{"show":false,"when":null,"eq":""},"validate":{"required":true,"minLength":8}},{"input":true,"tableView":false,"inputType":"password","label":"Verify Password","key":"verifyPassword","placeholder":"Enter your password again","prefix":"","suffix":"","protected":true,"persistent":true,"type":"password","conditional":{"show":false,"when":null,"eq":""},"validate":{"required":true,"custom":"valid = (input == \'{{ password }}\') ? true : \'Passwords must match.\';"}},{"input":true,"label":"Submit","tableView":false,"key":"submit","size":"md","leftIcon":"","rightIcon":"","block":false,"action":"submit","disableOnInvalid":true,"theme":"primary","type":"button"}]',
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
                            { label: '', value: '' },
                            { label: 'Equals', value: 'equals' },
                            { label: 'Does Not Equal', value: 'notEqual' },
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
                                conditional: {
                                  eq: '',
                                  show: false,
                                  when: null,
                                },
                                defaultValue: '',
                                input: true,
                                inputType: 'email',
                                key: 'email',
                                label: 'Email',
                                persistent: true,
                                placeholder: 'Enter your user email',
                                prefix: '',
                                protected: false,
                                suffix: '',
                                tableView: true,
                                type: 'email',
                                unique: false,
                                validate: { required: true },
                              } as EmailComponentDTO,
                              {
                                conditional: {
                                  eq: '',
                                  show: false,
                                  when: null,
                                },
                                input: true,
                                inputType: 'password',
                                key: 'password',
                                label: 'Password',
                                persistent: true,
                                placeholder: 'Enter your new password',
                                prefix: '',
                                protected: true,
                                suffix: '',
                                tableView: false,
                                type: 'password',
                                validate: { minLength: 8, required: true },
                              } as PasswordComponentDTO,
                              {
                                conditional: {
                                  eq: '',
                                  show: false,
                                  when: null,
                                },
                                input: true,
                                inputType: 'password',
                                key: 'verifyPassword',
                                label: 'Verify Password',
                                persistent: true,
                                placeholder: 'Enter your password again',
                                prefix: '',
                                protected: true,
                                suffix: '',
                                tableView: false,
                                type: 'password',
                                validate: {
                                  custom:
                                    "valid = (input == '{{ password }}') ? true : 'Passwords must match.';",
                                  required: true,
                                },
                              } as PasswordComponentDTO,
                              {
                                action: 'submit',
                                block: false,
                                disableOnInvalid: true,
                                input: true,
                                key: 'submit',
                                label: 'Submit',
                                leftIcon: '',
                                rightIcon: '',
                                size: 'md',
                                tableView: false,
                                theme: 'primary',
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
