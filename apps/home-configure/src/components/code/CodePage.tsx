import { CodeDTO } from '@steggy/controller-shared';
import { Col, Layout, Row } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { CodeEdit } from './CodeEdit';
import { CodeList } from './CodeList';

export function CodePage() {
  const [codeList, setCodeList] = useState<CodeDTO[]>([]);
  const [selected, setSelected] = useState<CodeDTO>();

  async function refresh() {
    setCodeList(
      await sendRequest({
        control: {
          select: ['friendlyName', 'modified'],
        },
        url: '/code',
      }),
    );
  }

  async function update(code: Partial<CodeDTO>) {
    const item = await sendRequest<CodeDTO>({
      body: code,
      method: 'put',
      url: `/code/${selected._id}`,
    });
    setSelected(item);
    setCodeList(codeList.map(i => (i._id === selected._id ? item : i)));
  }

  async function load(id: string) {
    setSelected(await sendRequest({ url: `/code/${id}` }));
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Layout>
      <Layout.Content style={{ padding: '16px' }}>
        <Row gutter={8}>
          <Col span={12}>
            <CodeList
              onUpdate={() => refresh()}
              code={codeList}
              onSelect={item => load(item._id)}
            />
          </Col>
          <Col span={12}>
            <CodeEdit code={selected} onUpdate={code => update(code)} />
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}
