import { RoutineStateComparisonDTO } from '@automagical/controller-shared';
import { FILTER_OPERATIONS, is } from '@automagical/utilities';
import { Card, Form } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { EntityHistory } from '../../entities';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

export class StateComparison extends React.Component<
  {
    comparison: RoutineStateComparisonDTO;
    onUpdate: (value: Partial<RoutineStateComparisonDTO>) => void;
  },
  { entities: string[] }
> {
  override state = { entities: [] };

  override async componentDidMount(): Promise<void> {
    await this.listEntities();
  }

  override render() {
    return (
      <>
        <Card title="State Comparison" type="inner">
          <Form.Item label="Entity">
            <FuzzySelect
              value={this.props.comparison.entity_id}
              data={this.state.entities.map(i => ({ text: i, value: i }))}
              onChange={entity_id => this.props.onUpdate({ entity_id })}
            />
          </Form.Item>
          <CompareValue
            operation={this.props.comparison.operation}
            value={this.props.comparison.value as FILTER_OPERATIONS}
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
        <EntityHistory entity={this.props.comparison.entity_id} />
      </>
    );
  }

  private async listEntities() {
    const entities = await sendRequest<string[]>(`/entity/list`);
    this.setState({ entities });
  }
}
