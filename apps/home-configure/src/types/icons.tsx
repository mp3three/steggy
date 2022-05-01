import AlarmBell from '@2fd/ant-design-icons/lib/AlarmBell';
import ApplicationVariable from '@2fd/ant-design-icons/lib/ApplicationVariable';
import BulletinBoard from '@2fd/ant-design-icons/lib/BulletinBoard';
import CardRemove from '@2fd/ant-design-icons/lib/CardRemove';
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
  ExclamationCircleOutlined,
  HomeOutlined,
  LoadingOutlined,
  SettingOutlined,
} from '@ant-design/icons';
type iconTypes =
  | 'clone'
  | 'entities'
  | 'execute'
  | 'filter'
  | 'groups'
  | 'home'
  | 'information'
  | 'list_add'
  | 'magnify'
  | 'menu'
  | 'capture'
  | 'metadata'
  | 'people'
  | 'plus_box'
  | 'refresh'
  | 'remove'
  | 'loading'
  | 'warning'
  | 'pin'
  | 'pin_off'
  | 'rooms'
  | 'routines'
  | 'run'
  | 'settings';

/**
 * Partially for consistent icons, partially because of the annoying way @2fd exports their stuff
 */
export const FD_ICONS = new Map<iconTypes, JSX.Element>([
  ['clone', <ContentCopy />],
  ['entities', <AlarmBell />],
  ['execute', <StepForward />],
  ['filter', <FilterVariant />],
  ['groups', <LightbulbGroupOutline />],
  ['home', <HomeOutlined />],
  ['capture', <CameraOutlined />],
  ['information', <InformationIcon />],
  ['list_add', <TimelinePlus />],
  ['magnify', <Magnify />],
  ['menu', <Menu />],
  ['loading', <LoadingOutlined />],
  ['metadata', <ApplicationVariable />],
  ['refresh', <RefreshCircle />],
  ['people', <NaturePeople />],
  ['plus_box', <PlusBoxMultiple />],
  ['remove', <CardRemove />],
  ['rooms', <BulletinBoard />],
  ['warning', <ExclamationCircleOutlined />],
  ['pin', <Pin />],
  ['pin_off', <PinOutline />],
  ['routines', <HomeAutomation />],
  ['run', <DebugStepInto />],
  ['settings', <SettingOutlined />],
]);
