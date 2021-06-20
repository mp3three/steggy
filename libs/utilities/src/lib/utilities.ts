/**
 * @example await sleep(5000);
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));
export const caseCorrect = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};
