import { scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function verifyPassword(
  plainPassword: string,
  storedHash: string
): boolean {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH);
  const storedKey = Buffer.from(hash, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}