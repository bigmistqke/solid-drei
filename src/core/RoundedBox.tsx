import { processProps } from '@/utils/process-props'
import { type NamedArrayTuple } from '@/utils/type-utils'
import { createMemo, createRenderEffect, type Ref } from 'solid-js'
import { autodispose, Entity, type S3 } from 'solid-three'
import { ExtrudeGeometry, Mesh, Shape } from 'three'
import { toCreasedNormals } from 'three-stdlib'

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

interface RoundedBoxProps extends Omit<S3.Props<Mesh>, 'args'> {
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

  const args = () => {
    const [width = 1, height = 1, depth = 1] = config.args
    return { width, height, depth }
  }

  const params = {
    get depth() {
      return args().depth - config.radius * 2
    },
    bevelEnabled: true,
    get bevelSegments() {
      return config.smoothness * 2
    },
    get steps() {
      return config.steps
    },
    get bevelSize() {
      return config.radius - eps
    },
    get bevelThickness() {
      return config.radius
    },
    get curveSegments() {
      return config.smoothness
    },
  }

  const shape = createMemo(() => createShape(args().width, args().height, config.radius))
  const geometry = createMemo(() => {
    const geometry = autodispose(new ExtrudeGeometry(shape(), params))
    createRenderEffect(() => {
      geometry.center()
      toCreasedNormals(geometry, config.creaseAngle)
    })
    return geometry
  })

  return (
    <Entity from={new Mesh()} {...rest}>
      <Entity from={geometry()} />
      {config.children}
    </Entity>
  )
}
