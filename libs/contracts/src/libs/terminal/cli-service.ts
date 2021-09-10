export interface CLIService {
  description: string[];
  name: string;

  exec(): Promise<void>;
}
