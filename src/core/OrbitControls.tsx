import { when } from '@/utils/conditionals'
import { processProps } from '@/utils/process-props'
import {
  createComputed,
  createEffect,
  createMemo,
  onCleanup,
  type JSXElement,
  type Ref,
} from 'solid-js'
import { autolisten, useFrame, useProps, useThree, type S3 } from 'solid-three'
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

export function useOrbitControls(three = useThree(), options?: OrbitControlsOptions) {
  const [config, rest] = processProps(
    options ?? {},
    {
      enableDamping: true,
      keyEvents: false,
      get camera() {
        return three.currentCamera
      },
      get domElement() {
        return three.gl.domElement
      },
    },
    [
      'camera',
      'domElement',
      'regress',
      'keyEvents',
      'onChange',
      'onStart',
      'onEnd',
      'object',
      'dispose',
    ],
  )

  const controls = createMemo<ThreeOrbitControls>(() => {
    const controls = new ThreeOrbitControls(config.camera)
    onCleanup(() => controls?.dispose())
    return controls
  })

  createComputed(
    when(controls, controls => {
      useFrame(() => controls.update())

      createEffect(() => controls.connect(config.domElement))
      createEffect(() => autolisten(controls)('start', config.onStart))
      createEffect(() => autolisten(controls)('change', config.onChange))
      createEffect(() => autolisten(controls)('end', config.onEnd))

      useProps(controls, rest, three)
    }),
  )

  return {
    controls,
  }
}

export function OrbitControls(props: OrbitControlsOptions) {
  useOrbitControls(useThree(), props)
  return null as unknown as JSXElement
}
