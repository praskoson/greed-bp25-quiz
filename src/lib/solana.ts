import { getBase58Codec } from "@solana/codecs";
import * as z from "zod";

const base58Codec = getBase58Codec();
const base58Alphabet =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

export const base58ZodValidator = z.stringFormat("base58", (val) => {
  if (!base58Alphabet.test(val)) return false;
  return base58Codec.getSizeFromValue(val) === 64;
});
