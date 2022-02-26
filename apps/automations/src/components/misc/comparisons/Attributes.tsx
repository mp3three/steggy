import { RoutineAttributeComparisonDTO } from '@automagical/controller-shared';
import { HassStateDTO } from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';
import { Card, Form, Input } from 'antd';
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
            <Input placeholder="friendly_name" />
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
    const state = await sendRequest<HassStateDTO>({
      url: `/entity/id/${entity_id}`,
    });
    this.setState({ state });
    this.props.onUpdate({ entity_id });
  }
}
