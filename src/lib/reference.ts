function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10);
  return out;
}

/**
 * Generates a reference code with the given prefix, retrying on collision.
 * `exists` should return true if the candidate is already taken.
 */
export async function generateUniqueReference(
  prefix: string,
  exists: (candidate: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${prefix}-${randomDigits(4)}`;
    if (!(await exists(candidate))) return candidate;
  }
  throw new Error("Could not generate a unique reference code, try again");
}
