import { RoutineComparisonDTO } from '@automagical/controller-shared';
import { HassStateDTO } from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Skeleton,
  Spin,
} from 'antd';
import { dump } from 'js-yaml';
import React from 'react';
import { sendRequest } from '../../types';
import { EntityHistory } from '../entities';
import { FilterValue } from './FilterValue';
import { FuzzySelect } from './FuzzySelect';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type tState = {
  attribute: string;
  entity: string;
  entities: string[];
  type: 'attribute' | 'date' | 'state' | 'template' | 'webhook';
  name: string;
  operation: string;
  state: HassStateDTO;
  value: string | string[];
};

export class GenericComparison extends React.Component<
  {
    comparison: RoutineComparisonDTO;
    onSave: (comparison: RoutineComparisonDTO) => void;
    visible: boolean;
  },
  tState
> {
  override state = {
    type: 'attribute',
    entities: [],
  } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
  }

  override render() {
    return (
      <Drawer
        visible={this.props.visible}
        size="large"
        title="Stop Processing Comparison"
        extra={
          <>
            <Button type="primary" style={{ marginRight: '8px' }}>
              Save
            </Button>
            <Button>Cancel</Button>
          </>
        }
      >
        {this.renderComparison()}
      </Drawer>
    );
  }

  private async listEntities() {
    const entities = await sendRequest<string[]>(`/entity/list`);
    this.setState({ entities });
  }

  private async loadEntity(entity_id: string) {
    const state = await sendRequest<HassStateDTO>(`/entity/id/${entity_id}`);
    this.setState({ state });
  }

  private renderComparison() {
    switch (this.state.type) {
      case 'state':
        return this.renderStateComparison();
      case 'attribute':
        return this.renderAttributeComparison();
    }
    return undefined;
  }

  private renderAttributeComparison() {
    return (
      <>
        <Card title="Attribute Comparison" type="inner">
          <Form.Item label="Entity">
            <FuzzySelect
              value={this.state.entity}
              data={this.state.entities.map(i => ({ text: i, value: i }))}
              onChange={entity => this.loadEntity(entity)}
            />
          </Form.Item>
          <Form.Item label="Attribute">
            <Input placeholder="friendly_name" />
          </Form.Item>
          <Form.Item label="Operation">
            <Select
              value={this.state.operation}
              onChange={operation => this.setState({ operation })}
            >
              <Select.Option value="eq">Equals</Select.Option>
              <Select.Option value="ne">Not Equals</Select.Option>
              <Select.Option value="in">In List</Select.Option>
              <Select.Option value="nin">Not In List</Select.Option>
              <Select.Option value="lt">Less Than</Select.Option>
              <Select.Option value="lte">Less Than / Equals</Select.Option>
              <Select.Option value="gt">Greater Than</Select.Option>
              <Select.Option value="gte">Greater Than / Equals</Select.Option>
              <Select.Option value="regex">Regular Expression</Select.Option>
              <Select.Option value="elem">List Element</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Value">
            {is.empty(this.state.operation) ? (
              <Skeleton />
            ) : (
              <FilterValue
                operation={this.state.operation}
                value={this.state.value}
                onChange={value => this.setState({ value })}
              />
            )}
          </Form.Item>
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

  private renderStateComparison() {
    return (
      <>
        <Card title="State Comparison" type="inner">
          <Form.Item label="Entity">
            <FuzzySelect
              value={this.state.entity}
              data={this.state.entities.map(i => ({ text: i, value: i }))}
              onChange={entity => this.setState({ entity })}
            />
          </Form.Item>
          <Form.Item label="Operation">
            <Select
              value={this.state.operation}
              onChange={operation => this.setState({ operation })}
            >
              <Select.Option value="eq">Equals</Select.Option>
              <Select.Option value="ne">Not Equals</Select.Option>
              <Select.Option value="in">In List</Select.Option>
              <Select.Option value="nin">Not In List</Select.Option>
              <Select.Option value="lt">Less Than</Select.Option>
              <Select.Option value="lte">Less Than / Equals</Select.Option>
              <Select.Option value="gt">Greater Than</Select.Option>
              <Select.Option value="gte">Greater Than / Equals</Select.Option>
              <Select.Option value="regex">Regular Expression</Select.Option>
              <Select.Option value="elem">List Element</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Value">
            {is.empty(this.state.operation) ? (
              <Skeleton />
            ) : (
              <FilterValue
                operation={this.state.operation}
                value={this.state.value}
                onChange={value => this.setState({ value })}
              />
            )}
          </Form.Item>
        </Card>
        <EntityHistory entity={this.state.entity} />
      </>
    );
  }
}
