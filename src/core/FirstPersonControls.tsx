import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { JSXElement, Ref } from 'solid-js'
import { createEffect, createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { autodispose, useFrame, useProps, useThree } from 'solid-three'
import type { OrthographicCamera, PerspectiveCamera } from 'three'
import { FirstPersonControls as ThreeFirstPersonControl } from 'three-stdlib'

type FirstPersonControlsPropsBase = Omit<S3.Props<typeof ThreeFirstPersonControl>, 'object'>
export interface FirstPersonControlsOptions extends FirstPersonControlsPropsBase {
  ref?: Ref<ThreeFirstPersonControl>
  camera?: PerspectiveCamera | OrthographicCamera
  domElement?: HTMLElement
  makeCurrent?: boolean
}

export function useFirstPersonControls(three: S3.Context, props?: FirstPersonControlsOptions) {
  const [config, rest] = processProps(
    props ?? {},
    {
      get camera() {
        return three.currentCamera
      },
    },
    ['camera', 'ref', 'domElement', 'makeCurrent'],
  )
  const store = useThree()
  const element = () => config.domElement /* || store.events.connected */ || store.gl.domElement
  const controls = createMemo(() =>
    autodispose(new ThreeFirstPersonControl(config.camera, element())),
  )

  createEffect(() => {
    controls().connect(element())
    useFrame((_, delta) => controls().enabled && controls().update(delta))
  })

  useRef(config, controls)
  useProps(controls, rest)

  return {
    controls,
  }
}

export function FirstPersonControls(props: FirstPersonControlsOptions) {
  useFirstPersonControls(useThree(), props)
  return null as JSXElement
}
