import { type Accessor, createSignal } from 'solid-js'
import { CursorRaycaster, useProps, useThree } from 'solid-three'
import { Camera, type Intersection, Raycaster } from 'three'

export function useCamera(camera: Camera | Accessor<Camera>, props?: Partial<Raycaster>) {
  const store = useThree()
  const [raycast] = createSignal(() => {
    const raycaster = new Raycaster()
    if (props) {
      useProps(raycaster, props)
    }
    return function (this: Raycaster, _: Raycaster, intersects: Intersection[]): void {
      const pointer = (store.raycaster as CursorRaycaster).pointer
      raycaster.setFromCamera(pointer, camera instanceof Camera ? camera : camera())
      const rc = this.constructor.prototype.raycast.bind(this)
      if (rc) rc(raycaster, intersects)
    }
  })
  return raycast
}
