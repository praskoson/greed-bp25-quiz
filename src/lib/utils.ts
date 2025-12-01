import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function shorten(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
