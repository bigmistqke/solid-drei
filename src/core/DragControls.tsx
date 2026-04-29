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
  createEffect(() => {
    const ctrl = controls()
    const objs = objects()
    // Swap out internal objects array by calling getObjects and mutating
    const current = ctrl.getObjects()
    current.length = 0
    current.push(...objs)
  })

  // Toggle enabled
  createEffect(() => {
    const ctrl = controls()
    ctrl.enabled = props.enabled !== false
  })

  // Event listeners
  createEffect(() => {
    const ctrl = controls()
    if (!props.onDragStart) return
    const cb = (e: DragControlsEventMap['dragstart']) => props.onDragStart!(e)
    ctrl.addEventListener('dragstart', cb)
    onCleanup(() => ctrl.removeEventListener('dragstart', cb))
  })

  createEffect(() => {
    const ctrl = controls()
    if (!props.onDrag) return
    const cb = (e: DragControlsEventMap['drag']) => props.onDrag!(e)
    ctrl.addEventListener('drag', cb)
    onCleanup(() => ctrl.removeEventListener('drag', cb))
  })

  createEffect(() => {
    const ctrl = controls()
    if (!props.onDragEnd) return
    const cb = (e: DragControlsEventMap['dragend']) => props.onDragEnd!(e)
    ctrl.addEventListener('dragend', cb)
    onCleanup(() => ctrl.removeEventListener('dragend', cb))
  })

  createEffect(() => {
    const ctrl = controls()
    if (!props.onHoverOn) return
    const cb = (e: DragControlsEventMap['hoveron']) => props.onHoverOn!(e)
    ctrl.addEventListener('hoveron', cb)
    onCleanup(() => ctrl.removeEventListener('hoveron', cb))
  })

  createEffect(() => {
    const ctrl = controls()
    if (!props.onHoverOff) return
    const cb = (e: DragControlsEventMap['hoveroff']) => props.onHoverOff!(e)
    ctrl.addEventListener('hoveroff', cb)
    onCleanup(() => ctrl.removeEventListener('hoveroff', cb))
  })

  useRef(props, controls)

  return resolved() as unknown as JSX.Element
}
