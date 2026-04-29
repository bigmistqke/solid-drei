import {
  createContext,
  createEffect,
  createRenderEffect,
  onCleanup,
  useContext,
  type JSX,
} from 'solid-js'
import type { Accessor } from 'solid-js'
import { createStore } from 'solid-js/store'

type KeyboardControlsState<T extends string = string> = { [K in T]: boolean }
type KeyboardControls<T extends string = string> = [Subscribe, KeyboardControlsState]
type Subscribe = (on: Accessor<boolean>, effect: (pressed: boolean) => void) => void
type KeyMap = Record<string, { fn: (value: boolean) => void; pressed: boolean; up: boolean }>

export interface KeyboardControlsEntry<T extends string = string> {
  /** Name of the action */
  name: T
  /** The keys that define it, you can use either event.key, or event.code */
  keys: string[]
  /** If the event receives the keyup event, true by default */
  up?: boolean
}

interface KeyboardControlsProps {
  /** A map of named keys */
  map: KeyboardControlsEntry[]
  /** All children will be able to useKeyboardControls */
  children: JSX.Element
  /** Optional onchange event */
  onChange?: (name: string, pressed: boolean, state: KeyboardControlsState) => void
  /** Optional event source */
  domElement?: HTMLElement
}

const keyboardControlsContext = /*@__PURE__*/ createContext<KeyboardControls>()

export function KeyboardControls(props: KeyboardControlsProps) {
  const key = () => props.map.map(item => item.name + item.keys).join('-')
  const [controls, setControls] = createStore<Record<string, boolean>>({})

  createRenderEffect(() => {
    setControls(() => props.map.reduce((prev, cur) => ({ ...prev, [cur.name]: false }), {}))
  })

  createEffect(
    () => key(),
    (keyValue) => {
      const config = props.map.map(({ name, keys, up }) => ({
        keys,
        up,
        fn: (value: boolean) => {
          // Set solid store
          setControls(name, value)
          // Inform callback
          if (props.onChange) props.onChange(name, value, controls)
        },
      }))

      const keyMap = config.reduce((out, { keys, fn, up = true }) => {
        keys.forEach(key => (out[key] = { fn, pressed: false, up }))
        return out
      }, {} as KeyMap)

      function downHandler({ key, code }: KeyboardEvent) {
        const obj = keyMap[key] || keyMap[code]
        if (!obj) return
        const { fn, pressed, up } = obj
        obj.pressed = true
        if (up || !pressed) fn(true)
      }

      function upHandler({ key, code }: KeyboardEvent) {
        const obj = keyMap[key] || keyMap[code]
        if (!obj) return
        const { fn, up } = obj
        obj.pressed = false
        if (up) fn(false)
      }

      const source = props.domElement || window
      source.addEventListener('keydown', downHandler as EventListener, {
        passive: true,
      })
      source.addEventListener('keyup', upHandler as EventListener, {
        passive: true,
      })

      onCleanup(() => {
        source.removeEventListener('keydown', downHandler as EventListener)
        source.removeEventListener('keyup', upHandler as EventListener)
      })
    },
  )

  function sub<T extends boolean>(boolean: Accessor<T>, effect: (pressed: T) => void) {
    createRenderEffect(
      () => boolean(),
      (value) => effect(value),
    )
  }

  return <keyboardControlsContext.Provider value={[sub, controls]} children={props.children} />
}

type Selector<T extends string = string> = (state: KeyboardControlsState<T>) => boolean

export function useKeyboardControls<T extends string = string>(): [Subscribe, KeyboardControlsState]
export function useKeyboardControls<T extends string = string>(
  sel: Selector<T>,
): Accessor<ReturnType<Selector<T>>>
export function useKeyboardControls<T extends string = string>(
  sel?: Selector<T>,
): Accessor<ReturnType<Selector<T>>> | [Subscribe, KeyboardControlsState] {
  const [sub, store] = useContext(keyboardControlsContext)!
  if (sel) return () => sel(store)
  else return [sub, store]
}
