export function attempt<T>(callback: () => T) {
  try {
    return callback()
  } catch {
    return undefined
  }
}

export function assertedNotNullish<T>(value: T | undefined, message?: string) {
  if (!value) {
    throw new Error(message)
  }
  return value
}
