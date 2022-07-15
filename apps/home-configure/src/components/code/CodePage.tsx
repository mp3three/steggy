import { CodeDTO } from '@steggy/controller-shared';
import { FilterDTO, is } from '@steggy/utilities';
import { Col, Layout, Row } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { CodeEdit } from './CodeEdit';
import { CodeList } from './CodeList';
import { CodeSearchUpdateProps } from './CodeSearch';

export function CodePage() {
  const [codeList, setCodeList] = useState<CodeDTO[]>([]);
  const [selected, setSelected] = useState<CodeDTO>();

  async function refresh(search: Partial<CodeSearchUpdateProps> = {}) {
    const filters = new Set<FilterDTO<keyof CodeDTO>>();
    if (!is.empty(search.code)) {
      filters.add({
        field: 'code',
        operation: 'regex',
        value: search.code,
      });
    }
    if (!is.empty(search.name)) {
      filters.add({
        field: 'friendlyName',
        operation: 'regex',
        value: search.name,
      });
    }
    if (!is.empty(search.type)) {
      filters.add({
        field: 'type',
        value: search.type,
      });
    }
    if (!is.empty(search.tags)) {
      filters.add({
        field: 'tags',
        operation: 'in',
        value: search.tags,
      });
    }
    setCodeList(
      await sendRequest({
        control: {
          filters,
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
              searchUpdate={search => refresh(search)}
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
