/**
 * Because setTimeout is slower (for the human) / more difficult to code with.
 *
 * Fight me.
 *
 * @example await sleep(5000);
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));
