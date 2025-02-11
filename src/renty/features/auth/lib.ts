import { hashSync } from "bcryptjs";

/**
 * Generates a random numeric code of specified length
 * @param length The length of the code to generate
 * @returns A string containing only numbers of the specified length
 */
export function generateRandomCode(length: number): string {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * 10)
  ).join('');
}

/**
 * Hashes a string using bcrypt's secure hashing algorithm
 * @param text The text to hash
 * @returns A promise that resolves to the hashed string
 */
export async function hash(text: string): Promise<string> {
  return hashSync(text, 10);
}
