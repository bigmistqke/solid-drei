import { createRenderEffect, type Accessor, type Ref } from 'solid-js'
import { resolve } from './resolve'

export function useRef<T>(props: { ref?: Ref<T> }, value: T | Accessor<T>) {
  createRenderEffect(() => {
    const result = resolve(value)

    console.log('USE REF!', result)

    if (typeof props.ref === 'function') {
      props.ref(result)
    } else {
      props.ref = result
    }
  })
}
