export class GetItemPayloadDTO {
  public item: string;
  public fields?: string[];
  public format?: 'JSON' | 'CSV';
  public ['include-archive']?: boolean;
  public ['share-link']?: boolean;
  public vault?: string;
}
