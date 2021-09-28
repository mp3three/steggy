export class MongoConnectDTO {
  ca?: string[];
  cert?: string;
  crl?: string[];
  key?: string;
  uri: string;
}
