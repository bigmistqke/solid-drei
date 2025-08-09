import { ControlUtils } from '@/core/control-utils'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { createEffect, createMemo, splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import type { Event } from 'three'
import { FlyControls as ThreeFlyControls } from 'three-stdlib'

type FlyControlsPropsBase = Omit<S3.Props<typeof ThreeFlyControls>, 'object'>
export interface FlyControlsProps extends FlyControlsPropsBase {
  ref?: Ref<ThreeFlyControls>
  onChange?: (e: Event<'change', ThreeFlyControls>) => void
  domElement?: HTMLElement
  makeDefault?: boolean
}

export function FlyControls(props: FlyControlsProps) {
  const [config, rest] = splitProps(props, ['domElement', 'onChange', 'makeDefault'])
  const store = useThree()
  const element = () => config.domElement /* || store.events.connected */ || store.gl.domElement
  const controls = createMemo(() => new ThreeFlyControls(store.camera, element()))

  ControlUtils.initialize(controls, element, store, config)

  createEffect(() => {
    if (!config.onChange) return
    ControlUtils.addEventHandler(controls, 'change', config.onChange)
  })

  useRef(props, controls)

  return <Entity from={controls()} {...rest} />
}
