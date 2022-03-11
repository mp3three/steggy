import { QuestionOutlined } from '@ant-design/icons';
import { RoutineTemplateComparisonDTO } from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import { Button, Card, Form, Input, Tooltip } from 'antd';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';

export class TemplateComparison extends React.Component<
  {
    comparison: RoutineTemplateComparisonDTO;
    onUpdate: (value: Partial<RoutineTemplateComparisonDTO>) => void;
  },
  { renderedTemplate: string }
> {
  override render() {
    return (
      <>
        <Card
          title="Template Comparison"
          type="inner"
          extra={
            <Tooltip title="Template is parsed with Home Assistant's templating service. The result is used in comparison">
              <QuestionOutlined />
            </Tooltip>
          }
        >
          <Form.Item label="Template">
            <Input.TextArea
              autoSize={{ maxRows: 20, minRows: 5 }}
              value={this.props.comparison.template}
              onChange={({ target }) =>
                this.props.onUpdate({ template: target.value })
              }
            />
          </Form.Item>
          <CompareValue
            operation={this.props.comparison.operation}
            value={this.props.comparison.value as string | string[]}
            onUpdate={({ value, operation }) => {
              if (!is.undefined(value)) {
                this.props.onUpdate({ value });
              }
              if (!is.undefined(operation)) {
                this.props.onUpdate({ operation });
              }
            }}
          />
        </Card>
        <Card
          type="inner"
          title="Rendered Template"
          style={{ marginTop: '16px' }}
          extra={
            <Button
              type="primary"
              size="small"
              onClick={this.renderTemplate.bind(this)}
            >
              Refresh
            </Button>
          }
        >
          <SyntaxHighlighter style={atomDark}>
            {this.state?.renderedTemplate ?? ''}
          </SyntaxHighlighter>
        </Card>
      </>
    );
  }

  private async renderTemplate() {
    const renderedTemplate = await sendRequest<string>({
      body: {
        template: this.props.comparison.template,
      },
      method: 'post',
      process: 'text',
      url: `/debug/render-template`,
    });
    this.setState({ renderedTemplate });
  }
}
