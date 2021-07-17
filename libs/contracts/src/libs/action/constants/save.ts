import {
  BaseComponentDTO,
  ButtonComponentDTO,
  ColumnsComponentDTO,
  ContainerComponentDTO,
  FieldSetComponentDTO,
  HiddenComponentDTO,
  HtmlElementComponentDTO,
  ResourceFieldsComponentDTO,
  SelectComponentDTO,
  TextAreaComponentDTO,
  TextFieldComponentDTO,
  WellComponentDTO,
} from '../../components';
import {
  ACTION_NAMES,
  FormDTO,
  HANDLERS,
  ProjectDTO,
} from '../../formio-sdk';
import { ACTION_METHOD } from '../../server';

export const SAVE_INFO = {
  access: {
    handler: false,
    method: false,
  },
  default: true,
  defaults: {
    handler: [HANDLERS.before],
    method: [ACTION_METHOD.create, ACTION_METHOD.update],
    name: ACTION_NAMES.save,
    priority: 10,
    title: 'Save Submission',
  },
  description: 'Saves the submission into the database.',
  group: 'default',
  name: ACTION_NAMES.save,
  priority: 10,
  title: 'Save Submission',
};

export const SAVE_SETTINGS_FORM = (
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
                basePath: `/project/${project._id}/form`,
                form: form._id,
                input: true,
                key: 'resource',
                placeholder: 'This form',
                required: false,
                title: 'Save submission to',
                type: 'resourcefields',
              } as ResourceFieldsComponentDTO,
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
                          json: JSON.stringify([
                            { key: '' },
                            ...form.components,
                          ]),
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
                                key: 'textField',
                                label: 'Text Field',
                                tableView: true,
                                type: 'textfield',
                              } as TextFieldComponentDTO,
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
