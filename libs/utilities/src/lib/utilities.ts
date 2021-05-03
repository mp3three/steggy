/**
 * @example await sleep(5000);
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));
