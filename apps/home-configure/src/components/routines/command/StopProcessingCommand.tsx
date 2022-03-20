import {
  RoutineCommandStopProcessingDTO,
  RoutineComparisonDTO,
} from '@automagical/controller-shared';
import { is, NOT_FOUND, TitleCase } from '@automagical/utilities';
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
import React from 'react';
import { v4 as uuid } from 'uuid';

import { GenericComparison } from '../../misc';

type tState = {
  addComparison: 'attribute' | 'date' | 'state' | 'template' | 'webhook';
  edit?: RoutineComparisonDTO;
};

export class StopProcessingCommand extends React.Component<
  {
    command: RoutineCommandStopProcessingDTO;
    disabled?: boolean;
    onUpdate: (command: Partial<RoutineCommandStopProcessingDTO>) => void;
  },
  tState
> {
  override state = {
    addComparison: 'state',
    comparisons: [],
    mode: 'any',
  } as tState;

  override render() {
    return (
      <>
        <Form.Item label="Matching Mode">
          <Radio.Group
            disabled={this.props.disabled}
            value={this.props.command?.mode}
            onChange={({ target }) =>
              this.props.onUpdate({ mode: target.value })
            }
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
                disabled={this.props.disabled}
                style={{ width: '100%' }}
                value={this.state.addComparison}
                onChange={addComparison => this.setState({ addComparison })}
              >
                <Select.Option value="state">State Comparison</Select.Option>
                <Select.Option value="attribute">
                  Attribute Comparison
                </Select.Option>
                <Select.Option value="template">Template Test</Select.Option>
                <Select.Option value="webhook">Webhook Test</Select.Option>
                <Select.Option value="date">Relative Date Test</Select.Option>
                <Select.Option value="room_metadata">
                  Room Metadata Test
                </Select.Option>
              </Select>
            </Col>
            <Col offset={1}>
              <Button
                disabled={this.props.disabled}
                type="primary"
                onClick={this.addComparison.bind(this)}
              >
                Add
              </Button>
            </Col>
          </Row>
        </Form.Item>
        {this.props.disabled ? (
          <Skeleton />
        ) : (
          <>
            <List
              dataSource={this.props.command?.comparisons}
              renderItem={item => (
                <List.Item onClick={() => this.setState({ edit: item })}>
                  <List.Item.Meta
                    title={item.friendlyName}
                    description={`${TitleCase(item.type)}`}
                  />
                  <Button
                    danger
                    type="text"
                    onClick={e => {
                      e.stopPropagation();
                      this.props.onUpdate({
                        comparisons: [
                          ...(this.props.command?.comparisons ?? []).filter(
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
            {is.undefined(this.state.edit) ? undefined : (
              <GenericComparison
                visible={true}
                comparison={this.state.edit}
                onCancel={() => this.setState({ edit: undefined })}
                onCommit={this.onCommit.bind(this)}
                onUpdate={edit => this.setState({ edit })}
              />
            )}
          </>
        )}
      </>
    );
  }

  private addComparison(): void {
    const edit = {
      comparison: {},
      friendlyName: `${TitleCase(this.state.addComparison)} test`,
      id: uuid(),
      type: this.state.addComparison,
    } as RoutineComparisonDTO;
    this.setState({ edit });
  }

  private onCommit(): void {
    const { edit } = this.state;
    const { command } = this.props;
    const index = (command?.comparisons ?? []).findIndex(
      ({ id }) => edit.id === id,
    );
    this.props.onUpdate({
      comparisons:
        index === NOT_FOUND
          ? [...(command?.comparisons ?? []), edit]
          : command.comparisons.map(i => (i.id === edit.id ? edit : i)),
    });
    this.setState({
      edit: undefined,
    });
  }
}
