// reference: https://medium.com/@luruke/simple-postprocessing-in-three-js-91936ecadfb7
// and @gsimone ;)
import type { Ref } from 'solid-js'
import { splitProps } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { BufferAttribute, BufferGeometry, Mesh } from 'three'

interface Props extends Omit<S3.Props<Mesh>, 'args'> {
  ref?: Ref<Mesh>
}

export function ScreenQuad(props: Props) {
  const [config, rest] = splitProps(props, ['children'])

  const geometry = new BufferGeometry()
  const vertices = new Float32Array([-1, -1, 3, -1, -1, 3])
  geometry.setAttribute('position', new BufferAttribute(vertices, 2))

  return (
    <Entity from={new Mesh()} geometry={geometry} frustumCulled={false} {...rest}>
      {config.children}
    </Entity>
  )
}
