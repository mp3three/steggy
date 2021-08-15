export type iLogFunction =
  | ((data: Record<string, unknown>) => void)
  | ((message: string) => void)
  | ((data: Record<string, unknown>, message: string) => void)
  | ((
      data: Record<string, unknown>,
      message: string,
      ...extra: unknown[]
    ) => void);
export type iLogger = Record<
  'info' | 'debug' | 'warn' | 'trace' | 'error' | 'fatal',
  iLogFunction
>;
