export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 5) {
  let i = 0;

  for (;;) {
    i++;
    try {
      return await fn();
    } catch (err) {
      if (i === retries) {
        throw err;
      }
      await sleep(i ** 2 * 100);
    }
  }
}
