import { Accessor, createRenderEffect, createSignal } from 'solid-js'

/**
 * Creates a writable signal from an accessor function.
 *
 * This function creates a signal that reflects the value returned by the accessor function.
 * The signal updates automatically whenever the accessor's return value changes.
 *
 * @template T - The type of the value.
 * @param accessor - A function that returns the current value.
 * @returns - A tuple containing the signal's getter and setter functions.
 *
 * @example
 * // Usage example
 * const [getValue, setValue] = createWritable(() => props.value);
 *
 * // Now getValue() will return the value of props.value, and setValue can be used to update it.
 */
export function createWritable<T>(accessor: Accessor<T>) {
  const signal = createSignal(accessor())
  createRenderEffect(() => signal[1](accessor()))
  return signal
}
