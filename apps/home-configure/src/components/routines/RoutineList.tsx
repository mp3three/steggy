import { RoutineDTO } from '@automagical/controller-shared';
import { ResultControlDTO } from '@automagical/utilities';
import { Breadcrumb, Col, Layout, Row } from 'antd';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { RoutineListDetail } from './RoutineListDetail';
import { RoutineTree } from './RoutineTree';

type tState = {
  routines: RoutineDTO[];
  search: string;
  selected?: RoutineDTO;
};

export const RoutineList = withRouter(
  class extends React.Component<
    { prop: unknown } & RouteComponentProps,
    tState
  > {
    override state: tState = { routines: [], search: '' };

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout>
          <Layout.Content style={{ padding: '16px' }}>
            <Breadcrumb style={{ marginBottom: '16px' }}>
              <Breadcrumb.Item>
                <Link to="/routines">Routines</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Row gutter={8}>
              <Col span={12}>
                <RoutineTree
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
          select: [
            'friendlyName',
            'command.id',
            'command.friendlyName',
            'command.type',
            'enable',
            'parent',
            'activate.id',
            'activate.friendlyName',
            'activate.type',
          ],
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
  },
);
