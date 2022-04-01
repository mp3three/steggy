import { RoutineDTO } from '@automagical/controller-shared';
import { ResultControlDTO, SECOND } from '@automagical/utilities';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { RoutineListDetail } from './RoutineListDetail';
import { RoutineTree } from './RoutineTree';

type tState = {
  enabled: string[];
  routines: RoutineDTO[];
  search: string;
  selected?: RoutineDTO;
};

export const RoutineList = withRouter(
  class extends React.Component<
    { prop: unknown } & RouteComponentProps,
    tState
  > {
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
                  onUpdate={this.refresh.bind(this)}
                  onSelect={selected => this.setState({ selected })}
                />
              </Col>
              <Col span={12}>
                <RoutineListDetail
                  routine={this.state.selected}
                  onUpdate={this.refresh.bind(this)}
                />
              </Col>
            </Row>
          </Layout.Content>
        </Layout>
      );
    }

    private async refresh(selected?: RoutineDTO): Promise<void> {
      await this.refreshEnabled();
      if (selected) {
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
      if (this.state.selected) {
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
  },
);
