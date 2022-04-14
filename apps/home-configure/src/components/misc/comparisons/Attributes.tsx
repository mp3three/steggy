import { RoutineAttributeComparisonDTO } from '@steggy/controller-shared';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Card, Form, Input, notification, Typography } from 'antd';
import { dump } from 'js-yaml';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

type tState = { entities: string[]; state?: HassStateDTO };

export class AttributeComparison extends React.Component<
  {
    comparison: RoutineAttributeComparisonDTO;
    onUpdate: (value: Partial<RoutineAttributeComparisonDTO>) => void;
  },
  tState
> {
  override state = { entities: [] } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
  }

  override render() {
    if (
      !is.empty(this.props.comparison?.entity_id) &&
      this.state.state?.entity_id !== this.props.comparison?.entity_id
    ) {
      this.loadEntity(this.props.comparison.entity_id);
    }
    return (
      <>
        <Card title="Attribute Comparison" type="inner">
          <Form.Item label="Entity">
            <FuzzySelect
              value={this.props.comparison.entity_id}
              data={this.state.entities.map(i => ({ text: i, value: i }))}
              onChange={entity => this.loadEntity(entity)}
            />
          </Form.Item>
          <Form.Item label="Attribute">
            <Input
              placeholder="friendly_name"
              onBlur={({ target }) =>
                this.props.onUpdate({ attribute: target.value })
              }
              defaultValue={this.props.comparison?.attribute}
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
          title="Current Attributes"
          type="inner"
          style={{ marginTop: '16px' }}
        >
          <SyntaxHighlighter language="yaml" style={atomDark}>
            {dump(this.state.state?.attributes).trimEnd()}
          </SyntaxHighlighter>
        </Card>
      </>
    );
  }

  private async listEntities() {
    const entities = await sendRequest<string[]>({ url: `/entity/list` });
    this.setState({ entities });
  }

  private async loadEntity(entity_id: string) {
    const entity = await sendRequest<HassStateDTO>({
      url: `/entity/id/${entity_id}`,
    });
    if (is.undefined(entity.attributes)) {
      notification.open({
        description: (
          <Typography>
            {`Server returned bad response. Verify that `}
            <Typography.Text code>{entity_id}</Typography.Text> still exists?
          </Typography>
        ),
        message: 'Entity not found',
        type: 'error',
      });
      return;
    }
    this.setState({ state: entity });
    this.props.onUpdate({ entity_id });
  }
}
