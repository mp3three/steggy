export class AudioBookRelated {
  title: string;
  url?: string;
}

export class AudioBookSpecs {
  public bitrate: string;
  public format: string;
}
export class AudioBookTorrent {
  public hash?: string;
  public size: string;
  public trackers: string[];
}

export class AudioBook {
  public abridged: string;
  public audioSample?: string;
  public author: string;
  public category: string[];
  public cover?: string;
  public description: string;
  public language: string;
  public narrator: string;
  public related: AudioBookRelated[];
  public specs: AudioBookSpecs;
  public title: string;
  public torrent: AudioBookTorrent;
}

export class BookListItemInfo {
  public format: string;
  public size: string;
  public sizeUnit: string;
  public unit: string;
}

export class BookListItem {
  public category: string[];
  public cover: string;
  public info: BookListItemInfo;
  public keywords: string[];
  public lang: string;
  public posted: string;
  public title: string;
  public url: string;
}

export class AudioBookInfo {
  public format: string;
  public size: string[];
  public unit: string;
}

export class Pagination {
  public count: number;
  public currentPage: number;
  public totalPages: number;
}
