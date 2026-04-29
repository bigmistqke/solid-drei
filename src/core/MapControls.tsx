import { processProps } from '@/utils'
import { createEffect, createRenderEffect, createMemo, type JSXElement, type Ref } from 'solid-js'
import { autodispose, useFrame, useProps, useThree, type S3 } from 'solid-three'
import { OrthographicCamera, PerspectiveCamera, type Event } from 'three'
import { MapControls as MapControlsImpl } from 'three-stdlib'
import { useAutolisten } from './useAutolisten'

export interface MapControlsOptions extends S3.Props<typeof MapControlsImpl> {
  ref?: Ref<MapControlsImpl>
  camera?: PerspectiveCamera | OrthographicCamera
  onChange?: (e?: Event<'change', MapControlsImpl>) => void
  onEnd?: (e?: Event<'end', MapControlsImpl>) => void
  onStart?: (e?: Event<'start', MapControlsImpl>) => void
  target?: S3.Vector3
}

export function MapControls(props: MapControlsOptions) {
  useMapControls(props)
  return null as unknown as JSXElement
}

export function useMapControls(options?: MapControlsOptions) {
  const store = useThree()

  const [config, rest] = processProps(
    options ?? {},
    {
      enableDamping: true,
      enabled: true,
      get camera() {
        return store.camera
      },
      get domElement() {
        return store.gl.domElement
      },
    },
    ['camera', 'dispose', 'domElement', 'enabled', 'onChange', 'onEnd', 'onStart'],
  )

  const controls = createMemo<MapControlsImpl>(() => {
    const controls = autodispose(new MapControlsImpl(config.camera))
    const autolisten = useAutolisten(controls)

    createRenderEffect(
      () => config.domElement,
      (elem) => controls.connect(elem),
    )
    createRenderEffect(
      () => config.onStart,
      (onStart) => autolisten('start', onStart),
    )
    createRenderEffect(
      () => config.onChange,
      (onChange) => autolisten('change', onChange),
    )
    createRenderEffect(
      () => config.onEnd,
      (onEnd) => autolisten('end', onEnd),
    )

    useProps(controls, rest, store)
    useFrame(() => controls.update())

    return controls
  })

  createEffect(
    () => config.enabled,
    (enabled) => { controls().enabled = enabled },
  )

  return { controls }
}
