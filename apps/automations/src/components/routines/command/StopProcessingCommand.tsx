import {
  RoutineCommandStopProcessingDTO,
  RoutineComparisonDTO,
} from '@automagical/controller-shared';
import { is, TitleCase } from '@automagical/utilities';
import { Button, Col, Divider, Form, List, Radio, Row, Select } from 'antd';
import React from 'react';
import { v4 as uuid } from 'uuid';

import { GenericComparison } from '../../misc';

type tState = {
  addComparison: 'attribute' | 'date' | 'state' | 'template' | 'webhook';
  comparisons: RoutineComparisonDTO[];
  edit?: RoutineComparisonDTO;
  mode: 'all' | 'any';
};

export class StopProcessingCommand extends React.Component<
  { command?: RoutineCommandStopProcessingDTO },
  tState
> {
  override state = {
    addComparison: 'state',
    comparisons: [],
    mode: 'any',
  } as tState;

  override componentDidMount(): void {
    const { command } = this.props;
    this.load(command);
  }

  public getValue(): RoutineCommandStopProcessingDTO {
    // return { duration: this.state.duration };
    return undefined;
  }

  public load({ mode }: Partial<RoutineCommandStopProcessingDTO> = {}): void {
    this.setState({ mode });
  }

  override render() {
    return (
      <>
        <Form.Item label="Matching Mode">
          <Radio.Group value={this.state.mode}>
            <Radio.Button value="all">All</Radio.Button>
            <Radio.Button value="any">Any</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Divider />
        <Form.Item label="Comparisons">
          <Row>
            <Col span={18}>
              <Select
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
              </Select>
            </Col>
            <Col offset={1}>
              <Button type="primary" onClick={this.addComparison.bind(this)}>
                Add
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <List dataSource={this.state.comparisons} />
        {is.undefined(this.state.edit) ? undefined : (
          <GenericComparison
            visible={true}
            comparison={this.state.edit}
            onCancel={() => console.log(`hit`)}
            onCommit={() => console.log(`hit`)}
            onUpdate={edit => this.setState({ edit })}
          />
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
    this.setState({ comparisons: [...this.state.comparisons, edit], edit });
  }
}
