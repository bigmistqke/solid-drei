import { Ref, createMemo, createRenderEffect } from 'solid-js'
import { S3, T } from 'solid-three'
import { ExtrudeGeometry, Mesh, Shape } from 'three'
import { toCreasedNormals } from 'three-stdlib'
import { processProps } from '../utils/process-props.ts'
import { NamedArrayTuple } from '../utils/type-utils.ts'

const eps = 0.00001

function createShape(width: number, height: number, radius0: number) {
  const shape = new Shape()
  const radius = radius0 - eps
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true)
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true)
  shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true)
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true)
  return shape
}

interface RoundedBoxProps extends Omit<S3.Props<'Mesh'>, 'args'> {
  ref?: Ref<Mesh>
  args?: NamedArrayTuple<(width?: number, height?: number, depth?: number) => void>
  radius?: number
  smoothness?: number
  steps?: number
  creaseAngle?: number
}

export function RoundedBox(props: RoundedBoxProps) {
  const [config, rest] = processProps(
    props,
    {
      args: [],
      radius: 0.05,
      steps: 1,
      smoothness: 4,
      creaseAngle: 0.4,
    },
    ['args', 'radius', 'steps', 'smoothness', 'creaseAngle', 'children'],
  )

  let geometry: ExtrudeGeometry

  const args = () => {
    const [width = 1, height = 1, depth = 1] = config.args
    return { width, height, depth }
  }

  const shape = createMemo(() => createShape(args().width, args().height, config.radius))
  const params = createMemo(() => ({
    depth: args().depth - config.radius * 2,
    bevelEnabled: true,
    bevelSegments: config.smoothness * 2,
    steps: config.steps,
    bevelSize: config.radius - eps,
    bevelThickness: config.radius,
    curveSegments: config.smoothness,
  }))

  createRenderEffect(() => {
    if (geometry) {
      geometry.center()
      toCreasedNormals(geometry, config.creaseAngle)
    }
  })

  return (
    <T.Mesh {...rest}>
      <T.ExtrudeGeometry ref={geometry!} args={[shape(), params()]} />
      {config.children}
    </T.Mesh>
  )
}
