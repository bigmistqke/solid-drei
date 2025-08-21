import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { JSXElement, Ref } from 'solid-js'
import { createEffect, createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { autolisten, useFrame, useProps, useThree } from 'solid-three'
import type { Event, OrthographicCamera, PerspectiveCamera } from 'three'
import { FlyControls as ThreeFlyControls } from 'three-stdlib'

type FlyControlsPropsBase = Omit<S3.Props<typeof ThreeFlyControls>, 'object'>
export interface FlyControlsProps extends FlyControlsPropsBase {
  ref?: Ref<ThreeFlyControls>
  camera?: PerspectiveCamera | OrthographicCamera
  onChange?: (e: Event<'change', ThreeFlyControls>) => void
  domElement?: HTMLElement
  makeCurrent?: boolean
}

export function useFlyControls(context: S3.Context, props: FlyControlsProps) {
  const [config, rest] = processProps(
    props,
    {
      get camera() {
        return context.camera
      },
      get domElement() {
        return context.gl.domElement
      },
    },
    ['camera', 'domElement', 'onChange', 'makeCurrent'],
  )

  const controls = createMemo(() => new ThreeFlyControls(config.camera, config.domElement))

  createEffect(() => {
    if (!config.onChange) return
    autolisten(controls())('change', config.onChange)
  })

  createEffect(() => {
    const _controls = controls()
    createEffect(() => _controls.connect(config.domElement))
    useFrame((_, delta) => _controls.update(delta))
  })

  useRef(props, controls)
  useProps(controls, rest)

  return {
    get controls() {
      return controls()
    },
  }
}

export function FlyControls(props: FlyControlsProps) {
  useFlyControls(useThree(), props)
  return null as unknown as JSXElement
}
