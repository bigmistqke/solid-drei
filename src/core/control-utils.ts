import type { Accessor } from 'solid-js'
import { createEffect } from 'solid-js'
import { useFrame, type S3 } from 'solid-three'
import type { Event } from 'three'

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
  store: any,
  config: { makeCurrent?: boolean },
) {
  connect(controls, element)
  makeCurrent(controls, store, config)
  update(controls)
}
function connect(controls: Accessor<ControlProto>, element: Accessor<HTMLElement>) {
  createEffect(
    () => [controls(), element()] as const,
    ([ctrl, elem]) => {
      ctrl.connect(elem)
      return () => ctrl.dispose()
    },
  )
}
function makeCurrent(
  controls: Accessor<ControlProto>,
  store: S3.Context,
  config: { makeCurrent?: boolean },
) {
  // createEffect(() => config.makeCurrent && store.setControls(controls()))
}
function update(controls: Accessor<ControlProto>) {
  createEffect(
    () => controls(),
    (ctrl) => {
      if ('enabled' in ctrl) {
        useFrame((_, delta) => ctrl.enabled && ctrl.update(delta))
      } else {
        useFrame((_, delta) => ctrl.update(delta))
      }
    },
  )
}
function getDomElement(store: any, config: { domElement?: HTMLElement }) {
  return config.domElement /* || store.events.connected */ || store.gl.domElement
}
function getCamera(store: any, config: { camera?: any }) {
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
    () => controls(),
    (ctrl) => {
      const callback = (e: Event<TEventName, TControl>) => selector(e)
      ctrl.addEventListener?.(eventType, callback)
      return () => ctrl.removeEventListener?.(eventType, callback)
    },
  )
}
export const ControlUtils = {
  initialize,
  connect,
  makeCurrent,
  update,
  getDomElement,
  getCamera,
  addEventHandler,
}
