export class GetItemPayloadDTO {
  public fields?: string[];
  public format?: 'JSON' | 'CSV';
  public ['include-archive']?: boolean;
  public item: string;
  public ['share-link']?: boolean;
  public vault?: string;
}
