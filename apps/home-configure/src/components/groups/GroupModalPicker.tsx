import { GroupDTO } from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Typography,
} from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import { useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

type tIdList = (GroupDTO & { highlighted?: string })[];

// eslint-disable-next-line radar/cognitive-complexity
export function GroupModalPicker(props: {
  exclude?: string[];
  highlight: boolean;
  onAdd: (selected: string[]) => void;
}) {
  const [available, setAvailable] = useState<tIdList>([]);
  const [modalVisible, setModalVisible] = useState<boolean>();
  const [searchText, setSearchText] = useState<string>();
  const [selected, setSelected] = useState<tIdList>([]);

  function fuzzySort(available: tIdList): tIdList {
    if (is.empty(searchText)) {
      return available;
    }
    return fuzzy
      .go(searchText, available, {
        key: 'friendlyName',
      })
      .map(result => {
        const { obj } = result;
        return {
          ...available.find(option => {
            return is.string(option)
              ? option === obj._id
              : option._id === obj._id;
          }),
          highlighted: fuzzy.highlight(
            result,
            '<span style="color:#F66">',
            '</span>',
          ),
        };
      });
  }

  function getList() {
    const exclude = props.exclude ?? [];
    const filtered = available.filter(
      item =>
        !exclude.includes(item._id) && selected.every(i => item._id !== i._id),
    );
    if (is.empty(searchText)) {
      return filtered.sort((a, b) =>
        a.friendlyName > b.friendlyName ? UP : DOWN,
      );
    }
    return fuzzySort(filtered);
  }

  function hide(e?: Event): void {
    if (!is.undefined(e)) {
      e.stopPropagation();
    }
    setModalVisible(false);
  }

  function onComplete(): void {
    props.onAdd(selected.map(({ _id }) => _id));
    setSelected([]);
    setModalVisible(false);
  }

  function removeItem(entity_id: string): void {
    setSelected(selected.filter(i => i._id !== entity_id));
  }

  async function show(e?: Event): Promise<void> {
    if (!is.undefined(e)) {
      e.stopPropagation();
    }
    setAvailable(undefined);
    setModalVisible(true);
    setSearchText('');
    setSelected([]);
    setAvailable(await sendRequest<GroupDTO[]>({ url: `/group` }));
  }

  return (
    <>
      <Button
        onClick={() => show()}
        size="small"
        icon={FD_ICONS.get('plus_box')}
        type={props.highlight ? 'primary' : 'text'}
      >
        Add groups
      </Button>
      <Modal
        title={<Typography.Text strong>Group List Builder</Typography.Text>}
        visible={modalVisible}
        onOk={() => onComplete()}
        onCancel={() => hide()}
      >
        {!available ? (
          <Spin tip="Loading" />
        ) : (
          <>
            <Input
              placeholder="Filter List"
              onChange={({ target }) => setSearchText(target.value)}
              value={searchText}
              suffix={
                <Button
                  onClick={() => setSearchText('')}
                  type="text"
                  size="small"
                >
                  {FD_ICONS.get('item_remove')}
                </Button>
              }
            />
            <List
              rowKey="_id"
              dataSource={getList()}
              pagination={{ size: 'small' }}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Button
                      type="primary"
                      shape="round"
                      size="small"
                      onClick={() => setSelected([...selected, item])}
                      icon={FD_ICONS.get('plus_box')}
                    />
                    <Typography.Text>
                      {!is.empty(item.highlighted)
                        ? parse(item.highlighted)
                        : item.friendlyName}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
            <Divider />
            {is.empty(selected) ? (
              <Empty description="Nothing added yet" />
            ) : (
              <List
                rowKey="_id"
                dataSource={selected}
                pagination={{ size: 'small' }}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Button
                        danger
                        shape="round"
                        type="text"
                        size="small"
                        onClick={() => removeItem(item._id)}
                        icon={FD_ICONS.get('item_remove')}
                      />
                      <Typography.Text>
                        {!is.empty(item.highlighted)
                          ? parse(item.highlighted)
                          : item.friendlyName}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
