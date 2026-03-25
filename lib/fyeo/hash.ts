/**
 * Deterministic djb2-style hash for percentage rollouts.
 * Same flagKey + userId always yields same bucket 0–99.
 */
export function hashToBucket(flagKey: string, userId: string): number {
  const str = `${flagKey}:${userId}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash) % 100;
}
