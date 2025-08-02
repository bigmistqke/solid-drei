import { createEffect, mergeProps, splitProps } from 'solid-js'
import type { JSXElement } from 'solid-js'
import { T } from 'solid-three'
import type { S3 } from 'solid-three'
import { BufferAttribute, PlaneGeometry } from 'three'

const easeInExpo = (x: number) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10))

export interface BackdropProps extends S3.Props<'Group'> {
  floor?: number
  segments?: number
  receiveShadow?: boolean
  children?: JSXElement
}

export function Backdrop(props: BackdropProps) {
  const [config, rest] = splitProps(mergeProps({ floor: 0.25, segments: 20 }, props), [
    'children',
    'floor',
    'segments',
    'receiveShadow',
  ])

  let planeGeometry: PlaneGeometry = null!
  createEffect(() => {
    let i = 0
    const offset = config.segments / config.segments / 2
    const position = planeGeometry.attributes.position as BufferAttribute
    for (let x = 0; x < config.segments + 1; x++) {
      for (let y = 0; y < config.segments + 1; y++) {
        position.setXYZ(
          i++,
          x / config.segments - offset + (x === 0 ? -config.floor : 0),
          y / config.segments - offset,
          easeInExpo(x / config.segments),
        )
      }
    }
    position.needsUpdate = true
    planeGeometry.computeVertexNormals()
  })
  return (
    <T.Group {...rest}>
      <T.Mesh receiveShadow={config.receiveShadow} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <T.PlaneGeometry ref={planeGeometry} args={[1, 1, config.segments, config.segments]} />
        {config.children}
      </T.Mesh>
    </T.Group>
  )
}
