export function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function isNotEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
