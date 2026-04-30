import { processProps, useRef } from '@/utils'
import type { JSXElement, Ref } from 'solid-js'
import { createEffect, createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { useFrame, useProps, useThree } from 'solid-three'
import type { Event, OrthographicCamera, PerspectiveCamera } from 'three'
import { FlyControls as ThreeFlyControls } from 'three-stdlib'

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

  createEffect(
    () => [controls(), config.onChange] as const,
    ([_controls, onChange]) => {
      if (!onChange) return
      _controls.addEventListener('change', onChange)
      return () => _controls.removeEventListener('change', onChange)
    },
  )

  createEffect(
    () => [controls(), config.domElement] as const,
    ([_controls, domElement]) => _controls.connect(domElement),
  )

  createEffect(
    () => config.enabled,
    enabled => { (controls() as ThreeFlyControls & { enabled: boolean }).enabled = enabled },
  )

  useRef(props, controls)
  useProps(controls, rest)
  useFrame((_, delta) => controls().update(delta))

  return {
    get controls() {
      return controls()
    },
  }
}
