import { useRef } from '@/utils'
import {
  children,
  createEffect,
  createMemo,
  onCleanup,
  type JSX,
  type Ref,
} from 'solid-js'
import { autodispose, useThree } from 'solid-three'
import { Object3D } from 'three'
import { DragControls as DragControlsImpl, type DragControlsEventMap } from 'three-stdlib'

export interface DragControlsProps {
  ref?: Ref<DragControlsImpl>
  /** Objects that can be dragged. Defaults to children. */
  objects?: Object3D[]
  /** Enable/disable the controls */
  enabled?: boolean
  /** Callback when drag starts */
  onDragStart?: (event: DragControlsEventMap['dragstart']) => void
  /** Callback during dragging */
  onDrag?: (event: DragControlsEventMap['drag']) => void
  /** Callback when drag ends */
  onDragEnd?: (event: DragControlsEventMap['dragend']) => void
  /** Callback on hover over */
  onHoverOn?: (event: DragControlsEventMap['hoveron']) => void
  /** Callback on hover off */
  onHoverOff?: (event: DragControlsEventMap['hoveroff']) => void
  children?: JSX.Element
  domElement?: HTMLElement
}

export function DragControls(props: DragControlsProps) {
  const store = useThree()

  // Collect child Object3D instances via children accessor
  const resolved = children(() => props.children)

  const objects = createMemo<Object3D[]>(() => {
    if (props.objects) return props.objects

    return (resolved.toArray() as unknown[]).filter((item): item is Object3D => item instanceof Object3D)
  })

  const domElement = () => props.domElement ?? store.gl.domElement

  const controls = createMemo(() => {
    const ctrl = autodispose(
      new DragControlsImpl(objects(), store.camera, domElement()),
    )
    return ctrl
  })

  // Update objects list when it changes
  createEffect(
    () => [controls(), objects()] as const,
    ([ctrl, objs]) => {
      // Swap out internal objects array by calling getObjects and mutating
      const current = ctrl.getObjects()
      current.length = 0
      current.push(...objs)
    }
  )

  // Toggle enabled
  createEffect(
    () => [controls(), props.enabled] as const,
    ([ctrl, enabled]) => {
      ctrl.enabled = enabled !== false
    }
  )

  // Event listeners
  createEffect(
    () => [controls(), props.onDragStart] as const,
    ([ctrl, onDragStart]) => {
      if (!onDragStart) return
      const cb = (e: DragControlsEventMap['dragstart']) => onDragStart!(e)
      ctrl.addEventListener('dragstart', cb)
      onCleanup(() => ctrl.removeEventListener('dragstart', cb))
    }
  )

  createEffect(
    () => [controls(), props.onDrag] as const,
    ([ctrl, onDrag]) => {
      if (!onDrag) return
      const cb = (e: DragControlsEventMap['drag']) => onDrag!(e)
      ctrl.addEventListener('drag', cb)
      onCleanup(() => ctrl.removeEventListener('drag', cb))
    }
  )

  createEffect(
    () => [controls(), props.onDragEnd] as const,
    ([ctrl, onDragEnd]) => {
      if (!onDragEnd) return
      const cb = (e: DragControlsEventMap['dragend']) => onDragEnd!(e)
      ctrl.addEventListener('dragend', cb)
      onCleanup(() => ctrl.removeEventListener('dragend', cb))
    }
  )

  createEffect(
    () => [controls(), props.onHoverOn] as const,
    ([ctrl, onHoverOn]) => {
      if (!onHoverOn) return
      const cb = (e: DragControlsEventMap['hoveron']) => onHoverOn!(e)
      ctrl.addEventListener('hoveron', cb)
      onCleanup(() => ctrl.removeEventListener('hoveron', cb))
    }
  )

  createEffect(
    () => [controls(), props.onHoverOff] as const,
    ([ctrl, onHoverOff]) => {
      if (!onHoverOff) return
      const cb = (e: DragControlsEventMap['hoveroff']) => onHoverOff!(e)
      ctrl.addEventListener('hoveroff', cb)
      onCleanup(() => ctrl.removeEventListener('hoveroff', cb))
    }
  )

  useRef(props, controls)

  return resolved() as unknown as JSX.Element
}
