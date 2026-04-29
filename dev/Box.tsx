import { createSignal } from 'solid-js'
import { T, useFrame } from 'solid-three'
import { Mesh } from 'three'

export function Box() {
  let mesh: Mesh
  const [hovered, setHovered] = createSignal(false)

  useFrame(() => (mesh!.rotation.y += 0.01))

  return (
    <T.Mesh
      ref={mesh!}
      onPointerEnter={e => setHovered(true)}
      onPointerLeave={e => setHovered(false)}
    >
      <T.BoxGeometry />
      <T.MeshStandardMaterial color={hovered() ? 'green' : 'red'} />
    </T.Mesh>
  )
}
