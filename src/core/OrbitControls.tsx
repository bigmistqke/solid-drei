import { processProps } from '@/utils'
import { createEffect, createMemo, createRenderEffect, type JSXElement, type Ref } from 'solid-js'
import { autodispose, useFrame, useProps, useThree, type S3 } from 'solid-three'
import { OrthographicCamera, PerspectiveCamera, type Event } from 'three'
import { OrbitControls as ThreeOrbitControls } from 'three-stdlib'

export interface OrbitControlsOptions extends S3.Props<typeof ThreeOrbitControls> {
  ref?: Ref<ThreeOrbitControls>
  enableDamping?: boolean
  camera?: PerspectiveCamera | OrthographicCamera
  onChange?: (e?: Event<'change', ThreeOrbitControls>) => void
  onEnd?: (e?: Event<'end', ThreeOrbitControls>) => void
  onStart?: (e?: Event<'start', ThreeOrbitControls>) => void
  regress?: boolean
  target?: S3.Vector3
  keyEvents?: boolean | HTMLElement
}

export function OrbitControls(props: OrbitControlsOptions) {
  useOrbitControls(props)
  return null as unknown as JSXElement
}

export function useOrbitControls(options?: OrbitControlsOptions) {
  const store = useThree()

  const [config, rest] = processProps(
    options ?? {},
    {
      enableDamping: true,
      keyEvents: false,
      enabled: true,
      get camera() {
        return store.camera
      },
      get domElement() {
        return store.gl.domElement
      },
    },
    [
      'camera',
      'dispose',
      'domElement',
      'enabled',
      'keyEvents',
      'object',
      'onChange',
      'onEnd',
      'onStart',
      'regress',
    ],
  )

  const controls = createMemo<ThreeOrbitControls>(() => {
    const controls = autodispose(new ThreeOrbitControls(config.camera))

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
