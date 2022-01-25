import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { CloseOutlined, FileAddOutlined } from '@ant-design/icons';
import { GroupDTO } from '@text-based/controller-shared';
import { INCREMENT, INVERT_VALUE, is, START } from '@text-based/utilities';
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
import React from 'react';

import { sendRequest } from '../../types';

const TEMP_TEMPLATE_SIZE = 3;

type tState = {
  available?: tIdList;
  modalVisible?: boolean;
  searchText?: string;
  selected: tIdList;
};
type tIdList = (GroupDTO & { highlighted?: string })[];

export class GroupModalPicker extends React.Component<
  {
    exclude?: string[];
    onAdd: (selected: string[]) => void;
  },
  tState
> {
  override state: tState = {
    selected: [],
  };
  private searchInput: Input;

  override render() {
    return (
      <>
        <Button
          onClick={this.show.bind(this)}
          size="small"
          icon={<PlusBoxMultiple />}
        >
          Add groups
        </Button>
        <Modal
          title="Group List Builder"
          visible={this.state?.modalVisible}
          onOk={this.onComplete.bind(this)}
          onCancel={this.hide.bind(this)}
        >
          {!this.state?.available ? (
            <Spin tip="Loading" />
          ) : (
            <>
              <Input
                placeholder="Filter List"
                onChange={this.search.bind(this)}
                ref={input => (this.searchInput = input)}
                value={this.state.searchText}
                suffix={
                  <Button
                    onClick={this.resetSearch.bind(this)}
                    type="text"
                    size="small"
                  >
                    <CloseOutlined />
                  </Button>
                }
              />
              <List
                rowKey="_id"
                dataSource={this.getList()}
                pagination={{ pageSize: 10 }}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Button
                        type="primary"
                        shape="round"
                        size="small"
                        onClick={() => this.addItem(item)}
                        icon={<FileAddOutlined />}
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
              {is.empty(this.state.selected) ? (
                <Empty description="Nothing added yet" />
              ) : (
                <List
                  rowKey="_id"
                  dataSource={this.state.selected}
                  pagination={{ pageSize: 10 }}
                  renderItem={item => (
                    <List.Item>
                      <Space>
                        <Button
                          danger
                          shape="round"
                          type="text"
                          size="small"
                          onClick={() => this.removeItem(item._id)}
                          icon={<CloseOutlined />}
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

  private addItem(group: GroupDTO): void {
    const selected = this.state.selected ?? [];
    selected.push(group);
    this.setState({ selected });
  }

  private fuzzySort(available: tIdList): tIdList {
    const { searchText } = this.state;
    if (is.empty(searchText)) {
      return available;
    }
    const fuzzyResult = fuzzy.go(searchText, available, {
      key: 'friendlyName',
    });
    const highlighted = fuzzyResult.map(result => {
      const { target } = result;
      const item = available.find(option => {
        return is.string(option) ? option === target : option._id === target;
      });
      return {
        ...item,
        highlighted: this.highlight(result),
      };
    });
    return highlighted;
  }

  private getList() {
    const exclude = this.props.exclude ?? [];
    const available = this.state.available.filter(
      item =>
        !exclude.includes(item._id) &&
        this.state.selected.every(i => item._id !== i._id),
    );
    if (is.empty(this.state.searchText)) {
      return available;
    }
    return this.fuzzySort(available);
  }

  private hide(e?: Event): void {
    if (!is.undefined(e)) {
      e.stopPropagation();
    }
    this.setState({ modalVisible: false });
  }

  private highlight(result) {
    const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
    const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
    let highlighted = '';
    let matchesIndex = 0;
    let opened = false;
    const { target, indexes } = result;
    for (let i = START; i < target.length; i++) {
      const char = target[i];
      if (indexes[matchesIndex] === i) {
        matchesIndex++;
        if (!opened) {
          opened = true;
          highlighted += open;
        }
        if (matchesIndex === indexes.length) {
          highlighted += char + close + target.slice(i + INCREMENT);
          break;
        }
        highlighted += char;
        continue;
      }
      if (opened) {
        opened = false;
        highlighted += close;
      }
      highlighted += char;
    }
    return highlighted.replace(
      new RegExp(`${open}(.*?)${close}`, 'g'),
      i =>
        `<span style="color:#F66">${i.slice(
          TEMP_TEMPLATE_SIZE,
          TEMP_TEMPLATE_SIZE * INVERT_VALUE,
        )}</span>`,
    );
  }

  private onComplete(): void {
    this.props.onAdd(this.state.selected.map(({ _id }) => _id));
    this.setState({ modalVisible: false, selected: [] });
  }

  private removeItem(entity_id: string): void {
    const selected = (this.state.selected || []).filter(
      i => i._id !== entity_id,
    );
    this.setState({ selected });
  }

  private resetSearch(): void {
    this.setState({ searchText: '' });
    this.searchInput.clearPasswordValueAttribute();
  }

  private search(e: Event): void {
    const target = e.target as HTMLInputElement;
    const searchText = target.value;
    this.setState({ searchText });
  }

  private async show(e?: Event): Promise<void> {
    if (!is.undefined(e)) {
      e.stopPropagation();
    }
    this.setState({
      available: undefined,
      modalVisible: true,
      searchText: '',
      selected: [],
    });
    this.setState({
      available: await sendRequest<GroupDTO[]>(`/group`),
    });
  }
}
