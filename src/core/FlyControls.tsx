import { processProps, useRef } from '@/utils'
import type { JSXElement, Ref } from 'solid-js'
import { createEffect, createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { useFrame, useProps, useThree } from 'solid-three'
import type { Event, OrthographicCamera, PerspectiveCamera } from 'three'
import { FlyControls as ThreeFlyControls } from 'three-stdlib'
import { useAutolisten } from './useAutolisten'

export interface FlyControlsProps extends Omit<S3.Props<typeof ThreeFlyControls>, 'object'> {
  ref?: Ref<ThreeFlyControls>
  camera?: PerspectiveCamera | OrthographicCamera
  onChange?: (e: Event<'change', ThreeFlyControls>) => void
  domElement?: HTMLElement
  makeCurrent?: boolean
  enabled?: boolean
}

export function FlyControls(props: FlyControlsProps) {
  useFlyControls(props)
  return null as unknown as JSXElement
}

export function useFlyControls(props: FlyControlsProps) {
  const context = useThree()
  const [config, rest] = processProps(
    props,
    {
      enabled: true,
      get camera() {
        return context.camera
      },
      get domElement() {
        return context.gl.domElement
      },
    },
    ['camera', 'domElement', 'enabled', 'onChange', 'makeCurrent'],
  )

  const controls = createMemo(() => new ThreeFlyControls(config.camera, config.domElement))
  const autolisten = useAutolisten(controls)

  // Attach event-listeners
  createEffect(
    () => config.onChange,
    onChange => autolisten('change', onChange),
  )

  // Connect controls to DOM
  createEffect(
    () => [controls(), config.domElement] as const,
    ([ctrl, elem]) => ctrl.connect(elem),
  )

  createEffect(
    () => config.enabled,
    (enabled) => { (controls() as ThreeFlyControls & { enabled: boolean }).enabled = enabled },
  )

  // Attach controls to props.ref
  useRef(props, controls)

  // Update controls with props
  useProps(controls, rest)

  // Update controls on each frame
  useFrame((_, delta) => controls().update(delta))

  return {
    get controls() {
      return controls()
    },
  }
}
