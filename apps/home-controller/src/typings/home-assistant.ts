export enum MobileDevice {
  iPhone = 'mobile_app_cameron_s_iphone',
  pixel2 = 'mobile_app_pixel',
  // iPad = 'mobile_app_camerons_ipad',
  generic = 'notify',
}

export enum NotificationGroup {
  door = 'Door Status',
  serverStatus = 'Server Status',
  battery = 'Battery Watch',
}

export type HueEvent = {
  event: number;
  buttonEvent: string;
  buttonNumber: '1' | '2' | '3' | '4';
};

export enum RoomsCode {
  bedroom = 'bedroom',
  games = 'games',
  guest = 'guest',
  garage = 'garage',
  livingRoom = 'living_room',
  loft = 'loft',
}
