import { RoutineDTO } from '@steggy/controller-shared';
import { is, SECOND } from '@steggy/utilities';
import { Col, Layout, Row } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { RoutineListDetail } from './RoutineListDetail';
import { RoutineTree } from './RoutineTree';

export function RoutinePage() {
  const [enabled, setEnabled] = useState<string[]>([]);
  const [routines, setRoutines] = useState<RoutineDTO[]>([]);
  const [selected, setSelected] = useState<RoutineDTO>();

  useEffect(() => {
    refresh();
    refreshEnabled();
    const interval = setInterval(
      async () => await refreshEnabled(),
      SECOND * 10,
    );
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onClone(selected: RoutineDTO) {
    await refresh(false);
    setSelected(selected);
  }

  async function refresh(selectedItem?: RoutineDTO | boolean): Promise<void> {
    await refreshEnabled();
    if (is.object(selectedItem)) {
      setRoutines(
        routines.map(i => (i._id === selectedItem._id ? selectedItem : i)),
      );
      setSelected(selectedItem);
      return;
    }
    const list = await sendRequest<RoutineDTO[]>({
      control: {
        sort: ['friendlyName'],
      },
      url: `/routine`,
    });
    setRoutines(list);
    if (selected && selectedItem !== false) {
      const found = list.find(({ _id }) => _id === selected._id);
      // More to clear out selected on delete than update object references
      setSelected(found);
    }
  }

  async function refreshEnabled(): Promise<void> {
    const enabled = await sendRequest<string[]>({
      url: `/debug/enabled-routines`,
    });
    setEnabled(enabled);
  }

  return (
    <Layout>
      <Layout.Content style={{ padding: '16px' }}>
        <Row gutter={8}>
          <Col span={12}>
            <RoutineTree
              enabled={enabled}
              routines={routines}
              routine={selected}
              onUpdate={() => refresh()}
              onSelect={selected => setSelected(selected)}
            />
          </Col>
          <Col span={12}>
            <RoutineListDetail
              onClone={routine => onClone(routine)}
              routine={selected}
              onUpdate={routine => refresh(routine)}
            />
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}
