import { RoutineAttributeComparisonDTO } from '@steggy/controller-shared';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Card, Form, Input, notification, Typography } from 'antd';
import { dump } from 'js-yaml';
import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { sendRequest } from '../../../types';
import { CompareValue } from '../CompareValue';
import { FuzzySelect } from '../FuzzySelect';

export function AttributeComparison(props: {
  comparison: RoutineAttributeComparisonDTO;
  onUpdate: (value: Partial<RoutineAttributeComparisonDTO>) => void;
}) {
  const [entities, setEntities] = useState<string[]>();
  const [state, setState] = useState<HassStateDTO>();

  useEffect(() => {
    async function listEntities() {
      const entities = await sendRequest<string[]>({ url: `/entity/list` });
      setEntities(entities);
    }
    listEntities();
  }, []);

  async function loadEntity(entity_id: string) {
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
    setState(entity);
    props.onUpdate({ entity_id });
  }

  if (
    !is.empty(props.comparison?.entity_id) &&
    state?.entity_id !== props.comparison?.entity_id
  ) {
    loadEntity(props.comparison.entity_id);
  }
  return (
    <>
      <Card title="Attribute Comparison" type="inner">
        <Form.Item label="Entity">
          <FuzzySelect
            value={props.comparison.entity_id}
            data={entities.map(i => ({ text: i, value: i }))}
            onChange={entity => loadEntity(entity)}
          />
        </Form.Item>
        <Form.Item label="Attribute">
          <Input
            placeholder="friendly_name"
            onBlur={({ target }) => props.onUpdate({ attribute: target.value })}
            defaultValue={props.comparison?.attribute}
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
        title="Current Attributes"
        type="inner"
        style={{ marginTop: '16px' }}
      >
        <SyntaxHighlighter language="yaml" style={atomDark}>
          {dump(state?.attributes).trimEnd()}
        </SyntaxHighlighter>
      </Card>
    </>
  );
}
