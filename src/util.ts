export class CorePlayError extends Error {
  readonly name = "CorePlayError"
}

export function assertNever(value: never): never {
  throw new CorePlayError(`Unexpected variant: ${JSON.stringify(value)}`)
}

export function mustGet<T>(items: readonly T[], index: number, label: string): T {
  const item = items[index]
  if (item === undefined) {
    throw new CorePlayError(`Missing ${label} at index ${index}`)
  }
  return item
}

export function stableHash(input: string): number {
  let hash = 2166136261
  for (const char of input) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug.length > 0 ? slug : "coreplay"
}
