import { splitProps } from 'solid-js'
import { defaultProps } from './default-props.ts'
import { KeyOfOptionals } from './type-utils.ts'

export function processProps<
  const TProps,
  const TKey extends KeyOfOptionals<TProps>,
  const TSplit extends readonly (keyof TProps)[],
>(props: TProps, defaults: Required<Pick<TProps, TKey>>, split?: TSplit) {
  return splitProps(defaultProps(props, defaults), split)
}
