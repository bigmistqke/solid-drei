import { createEffect, type Accessor, type Ref } from 'solid-js'

export function useRef<T>(props: { ref?: Ref<T> }, value: T | Accessor<T>) {
  createEffect(() => {
    const result = typeof value === 'function' ? value() : value
    if (typeof props.ref === 'function') {
      props.ref(result)
    } else {
      props.ref = result
    }
  })
}
