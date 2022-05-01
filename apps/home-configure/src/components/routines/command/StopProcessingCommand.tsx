import {
  RoutineCommandStopProcessingDTO,
  RoutineComparisonDTO,
} from '@steggy/controller-shared';
import { is, NOT_FOUND, TitleCase } from '@steggy/utilities';
import {
  Button,
  Col,
  Divider,
  Form,
  List,
  Radio,
  Row,
  Select,
  Skeleton,
} from 'antd';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { GenericComparison } from '../../misc';

// eslint-disable-next-line radar/cognitive-complexity
export function StopProcessingCommand(props: {
  command: RoutineCommandStopProcessingDTO;
  disabled?: boolean;
  onUpdate: (command: Partial<RoutineCommandStopProcessingDTO>) => void;
}) {
  const [addComparison, setComparison] = useState<
    'attribute' | 'date' | 'state' | 'template' | 'webhook'
  >();
  const [edit, setEdit] = useState<RoutineComparisonDTO>();

  function append(): void {
    setEdit({
      comparison: {},
      friendlyName: `${TitleCase(addComparison)} test`,
      id: uuid(),
      type: addComparison,
    } as RoutineComparisonDTO);
  }

  function onCommit(): void {
    const { command } = props;
    const index = (command?.comparisons ?? []).findIndex(
      ({ id }) => edit.id === id,
    );
    props.onUpdate({
      comparisons:
        index === NOT_FOUND
          ? [...(command?.comparisons ?? []), edit]
          : command.comparisons.map(i => (i.id === edit.id ? edit : i)),
    });
    setEdit(undefined);
  }

  return (
    <>
      <Form.Item label="Matching Mode">
        <Radio.Group
          buttonStyle="solid"
          size="small"
          disabled={props.disabled}
          value={props.command?.mode ?? 'any'}
          onChange={({ target }) => props.onUpdate({ mode: target.value })}
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="any">Any</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Divider />
      <Form.Item label="Comparisons">
        <Row>
          <Col span={18}>
            <Select
              size="small"
              disabled={props.disabled}
              style={{ width: '100%' }}
              value={addComparison}
              onChange={addComparison => setComparison(addComparison)}
            >
              <Select.Option value="state">State Comparison</Select.Option>
              <Select.Option value="attribute">
                Attribute Comparison
              </Select.Option>
              <Select.Option value="template">Template Test</Select.Option>
              <Select.Option value="webhook">Webhook Test</Select.Option>
              <Select.Option value="date">Relative Date Test</Select.Option>
              <Select.Option value="metadata">Metadata Test</Select.Option>
            </Select>
          </Col>
          <Col offset={1}>
            <Button
              size="small"
              disabled={props.disabled}
              type="primary"
              onClick={() => append()}
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form.Item>
      {props.disabled ? (
        <Skeleton />
      ) : (
        <>
          <List
            pagination={{ size: 'small' }}
            dataSource={props.command?.comparisons}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Button
                      onClick={() => setEdit(item)}
                      size="small"
                      type={edit?.id === item.id ? 'primary' : 'text'}
                    >
                      {item.friendlyName}
                    </Button>
                  }
                  description={`${TitleCase(item.type)}`}
                />
                <Button
                  danger
                  type="text"
                  onClick={e => {
                    e.stopPropagation();
                    props.onUpdate({
                      comparisons: [
                        ...(props.command?.comparisons ?? []).filter(
                          ({ id }) => id !== item.id,
                        ),
                      ],
                    });
                  }}
                >
                  X
                </Button>
              </List.Item>
            )}
          />
          {is.undefined(edit) ? undefined : (
            <GenericComparison
              visible={true}
              comparison={edit}
              onCancel={() => setEdit(undefined)}
              onCommit={() => onCommit()}
              onUpdate={edit => setEdit(edit)}
            />
          )}
        </>
      )}
    </>
  );
}
