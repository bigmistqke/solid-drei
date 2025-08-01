// Utility function to capitalize the first letter of the event type
export function capitalize<S extends string>(str: S): Capitalize<S> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>
}
