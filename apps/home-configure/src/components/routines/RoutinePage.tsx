import { RoutineDTO } from '@steggy/controller-shared';
import { is, ResultControlDTO, SECOND } from '@steggy/utilities';
import { Col, Layout, Row } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { RoutineListDetail } from './RoutineListDetail';
import { RoutineTree } from './RoutineTree';

type tState = {
  enabled: string[];
  routines: RoutineDTO[];
  search: string;
  selected?: RoutineDTO;
};

export class RoutinePage extends React.Component<{ prop: unknown }, tState> {
  override state: tState = { enabled: [], routines: [], search: '' };
  private interval: ReturnType<typeof setInterval>;

  override async componentDidMount(): Promise<void> {
    await this.refresh();
    await this.refreshEnabled();
    this.interval = setInterval(
      async () => await this.refreshEnabled(),
      SECOND * 10,
    );
  }

  override componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  override render() {
    return (
      <Layout>
        <Layout.Content style={{ padding: '16px' }}>
          <Row gutter={8}>
            <Col span={12}>
              <RoutineTree
                enabled={this.state.enabled}
                routines={this.state.routines}
                routine={this.state.selected}
                onUpdate={this.refresh.bind(this)}
                onSelect={selected => this.setState({ selected })}
              />
            </Col>
            <Col span={12}>
              <RoutineListDetail
                onClone={routine => this.onClone(routine)}
                routine={this.state.selected}
                onUpdate={routine => this.refresh(routine)}
              />
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }

  private async onClone(selected: RoutineDTO) {
    await this.refresh(false);
    this.setState({ selected });
  }

  private async refresh(selected?: RoutineDTO | boolean): Promise<void> {
    await this.refreshEnabled();
    if (is.object(selected)) {
      this.setState({
        routines: this.state.routines.map(i =>
          i._id === selected._id ? selected : i,
        ),
        selected,
      });
      return;
    }
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        sort: ['friendlyName'],
      } as ResultControlDTO,
      url: `/routine`,
    });
    this.setState({ routines });
    if (this.state.selected && selected !== false) {
      const selected = routines.find(
        ({ _id }) => _id === this.state.selected._id,
      );
      // More to clear out selected on delete than update object references
      this.setState({ selected });
    }
  }

  private async refreshEnabled(): Promise<void> {
    const enabled = await sendRequest<string[]>({
      url: `/debug/enabled-routines`,
    });
    this.setState({ enabled });
  }
}
