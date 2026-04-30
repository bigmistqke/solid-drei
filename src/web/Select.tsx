import { processProps } from '@/utils'
import type { Accessor } from 'solid-js'
import { createContext, createEffect, createSignal, useContext } from 'solid-js'
import { Entity, useThree, type S3 } from 'solid-three'
import {
  Group,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Material,
  type Mesh,
  type Object3D,
  type Scene,
} from 'three'
import { SelectionBox } from 'three-stdlib'

const context = createContext<Accessor<Object3D[]>>(() => [])
const Context = context

export interface SelectProps extends S3.Props<Group> {
  /** Allow multi select, default: false */
  multiple?: boolean
  /** Allow box select, default: false */
  box?: boolean
  /** Custom CSS border: default: '1px solid #55aaff' */
  border?: string
  /** Curom CSS color, default: 'rgba(75, 160, 255, 0.1)' */
  backgroundColor?: string
  /** Callback for selection changes */
  onChange?: (selected: Object3D[]) => void
  /** Callback for selection changes once the pointer is up */
  onChangePointerUp?: (selected: Object3D[]) => void
  /** Optional filter for filtering the selection */
  filter?: (selected: Object3D[]) => Object3D[]
}

export function Select(props: SelectProps) {
  const [config, rest] = processProps(
    props,
    {
      border: '1px solid #55aaff',
      backgroundColor: 'rgba(75, 160, 255, 0.1)',
      filter: item => item,
    },
    [
      'box',
      'multiple',
      'children',
      'onChange',
      'onChangePointerUp',
      'border',
      'backgroundColor',
      'filter',
    ],
  )

  const store = useThree()
  const group = new Group()

  const [downed, down] = createSignal(false)
  const [hovered, hover] = createSignal(false)
  const [active, setActive] = createSignal<Object3D[]>([])

  function dispatch({ object, shift }: { object?: Object3D | Object3D[]; shift?: boolean }) {
    if (object === undefined) {
      setActive([])
      return
    }
    if (Array.isArray(object)) {
      setActive(object)
      return
    }
    if (!shift) {
      setActive(active()[0] === object ? [] : [object])
      return
    }
    if (active().includes(object)) {
      setActive(active().filter(o => o !== object))
      return
    }
    setActive([object, ...active()])
  }

  createEffect(
    () => [downed(), active()] as const,
    () => {
      if (downed()) {
        config.onChange?.(active())
      } else {
        config.onChangePointerUp?.(active())
      }
    },
  )

  function onClick(e: S3.ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    dispatch({
      object: config.filter([e.intersection.object])[0],
      shift: config.multiple && e.nativeEvent.shiftKey,
    })
  }
  function onClickMissed() {
    if (!hovered()) {
      dispatch({})
    }
  }

  createEffect(
    () => [config.box, config.multiple] as const,
    () => {
      if (!config.box || !config.multiple) return

      const selBox = new SelectionBox(store.camera, group as unknown as Scene)

      const element = document.createElement('div')
      element.style.pointerEvents = 'none'
      element.style.border = config.border
      element.style.backgroundColor = config.backgroundColor
      element.style.position = 'fixed'

      const startPoint = new Vector2()
      const pointTopLeft = new Vector2()
      const pointBottomRight = new Vector2()

      // s3f: was using get(). before, hence the untrack
      // const oldRaycasterEnabled = untrack(() => store.events.enabled)
      // const oldControlsEnabled = (store.controls as any)?.enabled

      function prepareRay(event: PointerEvent, vector: Vector3) {
        const { offsetX, offsetY } = event
        const { width, height } = store.bounds
        vector.set((offsetX / width) * 2 - 1, -(offsetY / height) * 2 + 1, vector.z)
      }

      function onSelectStart(event: PointerEvent) {
        // if (store.controls) (store.controls as any).enabled = false
        // store.setEvents({ enabled: false })
        store.gl.domElement.parentElement?.appendChild(element)
        element.style.left = `${event.clientX}px`
        element.style.top = `${event.clientY}px`
        element.style.width = '0px'
        element.style.height = '0px'
        startPoint.x = event.clientX
        startPoint.y = event.clientY
      }

      function onSelectMove(event: PointerEvent) {
        pointBottomRight.x = Math.max(startPoint.x, event.clientX)
        pointBottomRight.y = Math.max(startPoint.y, event.clientY)
        pointTopLeft.x = Math.min(startPoint.x, event.clientX)
        pointTopLeft.y = Math.min(startPoint.y, event.clientY)
        element.style.left = `${pointTopLeft.x}px`
        element.style.top = `${pointTopLeft.y}px`
        element.style.width = `${pointBottomRight.x - pointTopLeft.x}px`
        element.style.height = `${pointBottomRight.y - pointTopLeft.y}px`
      }

      function onSelectOver() {
        if (downed()) {
          // if (store.controls) (store.controls as any).enabled = oldControlsEnabled
          // store.setEvents({ enabled: oldRaycasterEnabled })
          element.parentElement?.removeChild(element)
        }
      }

      let previous: Mesh<BufferGeometry, Material | Material[]>[] = []

      const controller = new AbortController()

      document.addEventListener(
        'pointerdown',
        (event: PointerEvent) => {
          if (event.shiftKey) {
            onSelectStart(event)
            prepareRay(event, selBox.startPoint)
          }
        },
        { passive: true, signal: controller.signal },
      )
      document.addEventListener(
        'pointermove',
        (event: PointerEvent) => {
          if (downed()) {
            onSelectMove(event)
            prepareRay(event, selBox.endPoint)
            const allSelected = selBox
              .select()
              .sort((o: Object3D) => o.uuid as unknown as number)
              .filter(o => o.isMesh)

            console.log(allSelected)

            // if (!shallow(allSelected, previous)) {
            // previous = allSelected
            // dispatch({ object: props.filter(allSelected) })
            // }
          }
        },
        { passive: true, capture: true, signal: controller.signal },
      )
      document.addEventListener(
        'pointerup',
        () => {
          if (downed()) {
            onSelectOver()
          }
        },
        { passive: true, signal: controller.signal },
      )
      return () => controller.abort()
    },
  )

  return (
    <Entity
      from={group}
      onClick={onClick}
      onPointerEnter={() => hover(true)}
      onPointerLeave={() => hover(false)}
      onPointerDown={() => down(true)}
      onPointerUp={() => down(false)}
      onClickMissed={onClickMissed}
      // {...rest}
    >
      <Context value={active}>{config.children}</Context>
    </Entity>
  )
}

export function useSelect() {
  return useContext(context)
}
