import { Accessor, createSignal } from 'solid-js'
import { applyProps, useThree } from 'solid-three'
import { Camera, Intersection, Raycaster } from 'three'

export function useCamera(camera: Camera | Accessor<Camera>, props?: Partial<Raycaster>) {
  const store = useThree()
  const [raycast] = createSignal(() => {
    const raycaster = new Raycaster()
    if (props) applyProps(raycaster, props, {})
    return function (_: Raycaster, intersects: Intersection[]): void {
      raycaster.setFromCamera(store.pointer, camera instanceof Camera ? camera : camera())
      const rc = this.constructor.prototype.raycast.bind(this)
      if (rc) rc(raycaster, intersects)
    }
  })
  return raycast
}
