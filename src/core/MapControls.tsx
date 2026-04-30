import { processProps } from '@/utils'
import { createEffect, createMemo, createRenderEffect, type JSXElement, type Ref } from 'solid-js'
import { autodispose, useFrame, useProps, useThree, type S3 } from 'solid-three'
import { OrthographicCamera, PerspectiveCamera, type Event } from 'three'
import { MapControls as MapControlsImpl } from 'three-stdlib'

export interface MapControlsOptions extends S3.Props<typeof MapControlsImpl> {
  ref?: Ref<MapControlsImpl>
  enableDamping?: boolean
  camera?: PerspectiveCamera | OrthographicCamera
  onChange?: (e?: Event<'change', MapControlsImpl>) => void
  onEnd?: (e?: Event<'end', MapControlsImpl>) => void
  onStart?: (e?: Event<'start', MapControlsImpl>) => void
  regress?: boolean
  target?: S3.Vector3
  keyEvents?: boolean | HTMLElement
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
    ['camera', 'domElement', 'enabled', 'onChange', 'onEnd', 'onStart', 'regress'],
  )

  const controls = createMemo<MapControlsImpl>(() => {
    const controls = autodispose(new MapControlsImpl(config.camera))

    createRenderEffect(
      () => config.domElement,
      elem => controls.connect(elem),
    )
    createRenderEffect(
      () => config.onStart,
      onStart => {
        if (!onStart) return
        controls.addEventListener('start', onStart)
        return () => controls.removeEventListener('start', onStart)
      },
    )
    createRenderEffect(
      () => config.onChange,
      onChange => {
        if (!onChange) return
        controls.addEventListener('change', onChange)
        return () => controls.removeEventListener('change', onChange)
      },
    )
    createRenderEffect(
      () => config.onEnd,
      onEnd => {
        if (!onEnd) return
        controls.addEventListener('end', onEnd)
        return () => controls.removeEventListener('end', onEnd)
      },
    )

    useProps(controls, rest, store)
    useFrame(() => controls.update())

    return controls
  })

  createEffect(
    () => config.enabled,
    enabled => { controls().enabled = enabled },
  )

  return { controls }
}
