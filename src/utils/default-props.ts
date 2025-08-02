import { mergeProps } from 'solid-js'
import type { MergeProps } from 'solid-js'
import type { KeyOfOptionals } from './type-utils'

export function defaultProps<T, K extends KeyOfOptionals<T>>(
  props: T,
  defaults: Required<Pick<T, K>>,
): MergeProps<[Required<Pick<T, K>>, T]> {
  return mergeProps(defaults, props)
}
