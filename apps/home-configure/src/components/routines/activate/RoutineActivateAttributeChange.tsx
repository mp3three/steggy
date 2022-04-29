import { AttributeChangeActivateDTO } from '@steggy/controller-shared';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { dump } from 'js-yaml';
import React, { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { sendRequest } from '../../../types';
import { FilterValue, FuzzySelect } from '../../misc';

export function RoutineActivateAttributeChange(props: {
  activate: AttributeChangeActivateDTO;
  onUpdate: (activate: Partial<AttributeChangeActivateDTO>) => void;
}) {
  const [entity, setEntity] = useState<HassStateDTO>();
  const [entityList, setEntityList] = useState<string[]>([]);

  useEffect(() => {
    async function updateEntity(entity: string): Promise<void> {
      props.onUpdate({ entity });
      setEntity(
        await sendRequest<HassStateDTO>({
          url: `/entity/id/${entity}`,
        }),
      );
    }
    updateEntity(props.activate.entity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.activate?.entity]);

  useEffect(() => {
    async function refresh(): Promise<void> {
      setEntityList(await sendRequest<string[]>({ url: `/entity/list` }));
    }
    refresh();
  }, []);

  const value = props.activate?.value;
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Entity">
        <FuzzySelect
          onChange={entity => props.onUpdate({ entity })}
          value={props.activate?.entity}
          data={entityList.map(id => ({ text: id, value: id }))}
        />
      </Form.Item>
      <Form.Item label="Current">
        {is.empty(props.activate?.entity) ? (
          <Skeleton />
        ) : (
          <SyntaxHighlighter language="yaml" style={atomDark}>
            {dump(entity?.attributes).trimEnd()}
          </SyntaxHighlighter>
        )}
      </Form.Item>
      <Form.Item
        label={
          <Tooltip
            title={<Typography>Accepts dot notation object paths</Typography>}
          >
            Attribute
          </Tooltip>
        }
      >
        <Input
          defaultValue={props.activate?.attribute}
          onBlur={({ target }) => props.onUpdate({ attribute: target.value })}
        />
      </Form.Item>
      <Form.Item label="Operation">
        <Select
          value={props.activate?.operation}
          onChange={operation => props.onUpdate({ operation })}
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
        {is.empty(props.activate?.operation) ? (
          <Skeleton />
        ) : (
          <FilterValue
            operation={props.activate?.operation}
            value={value as string | string[]}
            onChange={value => props.onUpdate({ value })}
          />
        )}
      </Form.Item>
      <Divider orientation="left">Modifiers</Divider>
      <Form.Item
        label={
          <Tooltip
            title={
              <Typography>
                <Typography.Paragraph>
                  When not checked, every state change reported by Home
                  Assistant is eligible to trigger routines.
                </Typography.Paragraph>
                <Divider />
                <Typography.Paragraph>
                  Some entities will repeatedly report the same state value (ex:
                  <Typography.Text code>on, on, on, off, on</Typography.Text>
                  ). Latching allows for filtering out of the repeat values.
                </Typography.Paragraph>
              </Typography>
            }
          >
            Latch
          </Tooltip>
        }
      >
        <Checkbox
          checked={props.activate?.latch}
          onChange={({ target }) => props.onUpdate({ latch: target.checked })}
        />
      </Form.Item>
      <Form.Item label="Debounce">
        <InputNumber
          value={props.activate?.debounce ?? -1}
          min={-1}
          onChange={debounce => props.onUpdate({ debounce })}
          addonAfter={'ms'}
        />
      </Form.Item>
    </Space>
  );
}
