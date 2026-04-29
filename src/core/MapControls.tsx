import { processProps } from '@/utils'
import { whenComputed } from '@/utils/conditionals'
import { createComputed, createMemo, onCleanup, type JSXElement, type Ref } from 'solid-js'
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

    whenComputed(
      () => config.enabled,
      () => {
        controls.enabled = true
        onCleanup(() => (controls.enabled = false))

        createComputed(() => controls.connect(config.domElement))

        createComputed(() => autolisten('start', config.onStart))
        createComputed(() => autolisten('change', config.onChange))
        createComputed(() => autolisten('end', config.onEnd))

        useProps(controls, rest, store)

        useFrame(controls.update)
      },
    )
    return controls
  })

  return { controls }
}
