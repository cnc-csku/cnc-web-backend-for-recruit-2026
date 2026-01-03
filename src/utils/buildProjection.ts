export function buildProjection(update: Record<string, unknown>) {
  return Object.fromEntries(Object.keys(update).map((key) => [key, 1]));
}
