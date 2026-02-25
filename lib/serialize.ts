export function toJSONSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  ) as T;
}
