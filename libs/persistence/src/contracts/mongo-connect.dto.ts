export class MongoConnectDTO {
  uri: string;
  ca?: string[];
  crl?: string[];
  key?: string;
  cert?: string;
}
