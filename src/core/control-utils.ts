import { Accessor, createEffect, onCleanup } from 'solid-js'
import { S3, useFrame } from 'solid-three'
import { Event } from 'three'
import { whenever } from '../utils/conditionals.ts'

type ControlProtoBase = {
  update: (delta: number) => void
  connect: (element: HTMLElement) => void
  dispose: () => void
}

export type ControlProto =
  // TransformControls has `enabled` as a private member
  | ControlProtoBase
  | (ControlProtoBase & {
      enabled: boolean
    })

function initialize(
  controls: Accessor<ControlProto>,
  element: Accessor<HTMLElement>,
  store: S3.ThreeContext,
  config: { makeDefault?: boolean },
) {
  connect(controls, element)
  makeDefault(controls, store, config)
  update(controls)
}
function connect(controls: Accessor<ControlProto>, element: Accessor<HTMLElement>) {
  createEffect(() => {
    controls().connect(element())
    onCleanup(() => controls().dispose())
  })
}
function makeDefault(
  controls: Accessor<ControlProto>,
  store: S3.ThreeContext,
  config: { makeDefault?: boolean },
) {
  createEffect(() => config.makeDefault && store.setControls(controls()))
}
function update(controls: Accessor<ControlProto>) {
  createEffect(
    whenever(controls, controls => {
      if ('enabled' in controls) {
        useFrame((_, delta) => controls.enabled && controls.update(delta))
      } else {
        useFrame((_, delta) => controls.update(delta))
      }
    }),
  )
}
function getDomElement(store: S3.ThreeContext, config: { domElement?: HTMLElement }) {
  return config.domElement /* || store.events.connected */ || store.gl.domElement
}
function getCamera(store: S3.ThreeContext, config: { camera?: S3.CameraType }) {
  return config.camera || store.camera
}
function addEventHandler<
  const TControl extends {
    addEventListener: (event: TEventName, callback: (event: any) => void) => void
    removeEventListener: (event: TEventName, callback: (event: any) => void) => void
  },
  const TEventName extends string,
>(
  controls: Accessor<TControl>,
  eventType: TEventName,
  selector: (event: Event<TEventName, TControl>) => void,
) {
  createEffect(
    whenever(controls, controls => {
      const callback = (e: Event<TEventName, TControl>) => selector(e)
      controls.addEventListener?.(eventType, callback)
      onCleanup(() => controls.removeEventListener?.(eventType, callback))
    }),
  )
}
export const ControlUtils = {
  initialize,
  connect,
  makeDefault,
  update,
  getDomElement,
  getCamera,
  addEventHandler,
}
