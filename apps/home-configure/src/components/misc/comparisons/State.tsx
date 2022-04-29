import { RoutineStateComparisonDTO } from '@steggy/controller-shared';
import { FILTER_OPERATIONS, is } from '@steggy/utilities';
import { Card, Form } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';
import { EntityHistory } from '../../entities';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

export function StateComparison(props: {
  comparison: RoutineStateComparisonDTO;
  onUpdate: (value: Partial<RoutineStateComparisonDTO>) => void;
}) {
  const [entities, setEntities] = useState<string[]>([]);

  useEffect(() => {
    async function listEntities() {
      const entities = await sendRequest<string[]>({ url: `/entity/list` });
      setEntities(entities);
    }
    listEntities();
  }, []);
  return (
    <>
      <Card title="State Comparison" type="inner">
        <Form.Item label="Entity">
          <FuzzySelect
            value={props.comparison.entity_id}
            data={entities.map(i => ({ text: i, value: i }))}
            onChange={entity_id => props.onUpdate({ entity_id })}
          />
        </Form.Item>
        <CompareValue
          operation={props.comparison.operation}
          value={props.comparison.value as FILTER_OPERATIONS}
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
      <EntityHistory entity={props.comparison.entity_id} />
    </>
  );
}
