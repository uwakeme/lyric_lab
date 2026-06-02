// Shared ID generation utility
export function generateId(): string {
  return crypto.randomUUID().slice(0, 9);
}
