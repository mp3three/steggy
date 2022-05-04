import { RoutineTemplateComparisonDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Form, Input, Tooltip } from 'antd';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { FD_ICONS, sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';

export function TemplateComparison(props: {
  comparison: RoutineTemplateComparisonDTO;
  onUpdate: (value: Partial<RoutineTemplateComparisonDTO>) => void;
}) {
  const [renderedTemplate, setRenderedTemplate] = useState('');

  async function renderTemplate() {
    const renderedTemplate = await sendRequest<string>({
      body: {
        template: props.comparison.template,
      },
      method: 'post',
      process: 'text',
      url: `/debug/render-template`,
    });
    setRenderedTemplate(renderedTemplate);
  }

  return (
    <>
      <Card
        title="Template Comparison"
        type="inner"
        extra={
          <Tooltip title="Template is parsed with Home Assistant's templating service. The result is used in comparison">
            {FD_ICONS.get('information')}
          </Tooltip>
        }
      >
        <Form.Item label="Template">
          <Input.TextArea
            autoSize={{ maxRows: 20, minRows: 5 }}
            defaultValue={props.comparison.template}
            onBlur={({ target }) => props.onUpdate({ template: target.value })}
          />
        </Form.Item>
        <CompareValue
          operation={props.comparison.operation}
          value={props.comparison.value as string | string[]}
          onUpdate={({ value, operation }) => {
            if (!is.undefined(value)) {
              props.onUpdate({ value });
            }
            if (!is.undefined(operation)) {
              props.onUpdate({ operation });
            }
          }}
        />
      </Card>
      <Card
        type="inner"
        title="Rendered Template"
        style={{ marginTop: '16px' }}
        extra={
          <Button type="primary" size="small" onClick={() => renderTemplate()}>
            Refresh
          </Button>
        }
      >
        <SyntaxHighlighter style={atomDark}>
          {renderedTemplate}
        </SyntaxHighlighter>
      </Card>
    </>
  );
}
