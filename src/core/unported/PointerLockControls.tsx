import { Ref, createEffect, createMemo, onCleanup, splitProps, untrack } from 'solid-js'
import { S3, T, useThree } from 'solid-three'
import * as THREE from 'three'
import { PointerLockControls as ThreePointerLockControls } from 'three-stdlib'
import { whenever } from '~/utils/conditionals'

export interface PointerLockControlsProps extends S3.ClassProps<typeof ThreePointerLockControls> {
  ref?: Ref<ThreePointerLockControls>
  domElement?: HTMLElement
  selector?: string
  enabled?: boolean
  camera?: THREE.Camera
  onChange?: (e?: THREE.Event) => void
  onLock?: (e?: THREE.Event) => void
  onUnlock?: (e?: THREE.Event) => void
  makeDefault?: boolean
}

export function PointerLockControls(props: PointerLockControlsProps) {
  const [config, rest] = splitProps(props, [
    'camera',
    'domElement',
    'selector',
    'onChange',
    'onLock',
    'onUnlock',
    'enabled',
    'makeDefault',
  ])

  const store = useThree()
  const camera = () => config.camera || store.camera
  const domElement = () => config.domElement /*  || store.events.connected */ || store.gl.domElement
  const controls = createMemo(() => new ThreePointerLockControls(camera()))

  createEffect(() => config.makeDefault && store.setControl(controls()))

  createEffect(() => {
    if (config.enabled || config.enabled === undefined) {
      controls().connect(domElement())

      // Force events to be centered while PLC is active
      const oldComputeOffsets = untrack(() => store.events.compute)
      store.setEvents({
        compute(event: DomEvent, state: RootState) {
          const offsetX = state.size.width / 2
          const offsetY = state.size.height / 2
          state.pointer.set(
            (offsetX / state.size.width) * 2 - 1,
            -(offsetY / state.size.height) * 2 + 1,
          )
          state.raycaster.setFromCamera(state.pointer, state.camera)
        },
      })
      onCleanup(() => {
        controls().disconnect()
        store.setEvents({ compute: oldComputeOffsets })
      })
    }
  })

  createEffect(
    whenever(controls, controls => {
      const onChangeHandler = (e: THREE.Event) => config.onChange?.(e)
      controls.addEventListener('change', onChangeHandler)
      onCleanup(() => controls.removeEventListener('change', onChangeHandler))

      createEffect(
        whenever(
          () => config.onLock,
          handler => {
            controls.addEventListener('lock', handler)
            onCleanup(() => controls.removeEventListener('lock', handler))
          },
        ),
      )

      createEffect(
        whenever(
          () => config.onUnlock,
          handler => {
            controls.addEventListener('unlock', handler)
            onCleanup(() => controls.removeEventListener('unlock', handler))
          },
        ),
      )

      createEffect(() => {
        // Enforce previous interaction
        const onClickHandler = () => controls.lock()
        const elements = config.selector
          ? Array.from(document.querySelectorAll(config.selector))
          : [document]

        elements.forEach(element => element.addEventListener('click', onClickHandler))
        onCleanup(() => {
          elements.forEach(element => element.removeEventListener('click', onClickHandler))
        })
      })
    }),
  )

  return <T.Primitive object={controls()} {...rest} />
}
