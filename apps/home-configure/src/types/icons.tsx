import AlarmBell from '@2fd/ant-design-icons/lib/AlarmBell';
import ApplicationVariable from '@2fd/ant-design-icons/lib/ApplicationVariable';
import BulletinBoard from '@2fd/ant-design-icons/lib/BulletinBoard';
import CardRemove from '@2fd/ant-design-icons/lib/CardRemove';
import CodeJson from '@2fd/ant-design-icons/lib/CodeJson';
import ContentCopy from '@2fd/ant-design-icons/lib/ContentCopy';
import DebugStepInto from '@2fd/ant-design-icons/lib/DebugStepInto';
import FilterVariant from '@2fd/ant-design-icons/lib/FilterVariant';
import HomeAutomation from '@2fd/ant-design-icons/lib/HomeAutomation';
import InformationIcon from '@2fd/ant-design-icons/lib/Information';
import LightbulbGroupOutline from '@2fd/ant-design-icons/lib/LightbulbGroupOutline';
import Magnify from '@2fd/ant-design-icons/lib/Magnify';
import Menu from '@2fd/ant-design-icons/lib/Menu';
import NaturePeople from '@2fd/ant-design-icons/lib/NaturePeople';
import Pin from '@2fd/ant-design-icons/lib/Pin';
import PinOutline from '@2fd/ant-design-icons/lib/PinOutline';
import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import RefreshCircle from '@2fd/ant-design-icons/lib/RefreshCircle';
import StepForward from '@2fd/ant-design-icons/lib/StepForward';
import TimelinePlus from '@2fd/ant-design-icons/lib/TimelinePlus';
import {
  CameraOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  ExclamationOutlined,
  FolderFilled,
  FolderOpenFilled,
  HomeOutlined,
  LoadingOutlined,
  MenuOutlined,
  SettingOutlined,
} from '@ant-design/icons';

type iconTypes =
  | 'capture'
  | 'clone'
  | 'code'
  | 'delete'
  | 'drag_handle'
  | 'entities'
  | 'error'
  | 'execute'
  | 'filter'
  | 'folder_open'
  | 'folder'
  | 'groups'
  | 'home'
  | 'information'
  | 'item_remove'
  | 'list_add'
  | 'loading'
  | 'magnify'
  | 'menu'
  | 'metadata'
  | 'people'
  | 'pin_off'
  | 'pin'
  | 'plus_box'
  | 'refresh'
  | 'remove'
  | 'rooms'
  | 'routines'
  | 'run'
  | 'settings'
  | 'warning';

export const FD_ICONS = new Map<iconTypes, JSX.Element>([
  ['capture', <CameraOutlined />],
  ['clone', <ContentCopy />],
  ['code', <CodeJson />],
  ['delete', <ExclamationOutlined style={{ color: 'red' }} />],
  ['drag_handle', <MenuOutlined style={{ color: '#999', cursor: 'grab' }} />],
  ['entities', <AlarmBell />],
  ['error', <ExclamationCircleOutlined style={{ color: '#AA0000' }} />],
  ['execute', <StepForward />],
  ['filter', <FilterVariant />],
  ['folder', <FolderFilled />],
  ['folder_open', <FolderOpenFilled />],
  ['groups', <LightbulbGroupOutline />],
  ['home', <HomeOutlined />],
  ['information', <InformationIcon />],
  ['item_remove', <CloseOutlined />],
  ['list_add', <TimelinePlus />],
  ['loading', <LoadingOutlined />],
  ['magnify', <Magnify />],
  ['menu', <Menu />],
  ['metadata', <ApplicationVariable />],
  ['people', <NaturePeople />],
  ['pin_off', <PinOutline />],
  ['pin', <Pin />],
  ['plus_box', <PlusBoxMultiple />],
  ['refresh', <RefreshCircle />],
  ['remove', <CardRemove />],
  ['rooms', <BulletinBoard />],
  ['routines', <HomeAutomation />],
  ['run', <DebugStepInto />],
  ['settings', <SettingOutlined />],
  ['warning', <ExclamationCircleOutlined style={{ color: '#AAAA00' }} />],
]);
