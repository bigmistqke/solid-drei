import type { JSXElement } from 'solid-js'
import { createEffect, merge, omit } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { BufferAttribute, Group, Mesh, PlaneGeometry } from 'three'

const easeInExpo = (x: number) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10))

export interface BackdropProps extends S3.Props<typeof Group> {
  floor?: number
  segments?: number
  receiveShadow?: boolean
  children?: JSXElement
}

export function Backdrop(props: BackdropProps) {
  const merged = merge({ floor: 0.25, segments: 20 }, props)
  const rest = omit(merged, 'children', 'floor', 'segments', 'receiveShadow')

  let planeGeometry: PlaneGeometry = null!

  createEffect(() => {
    let i = 0
    const offset = merged.segments / merged.segments / 2
    const position = planeGeometry.attributes.position as BufferAttribute
    for (let x = 0; x < merged.segments + 1; x++) {
      for (let y = 0; y < merged.segments + 1; y++) {
        position.setXYZ(
          i++,
          x / merged.segments - offset + (x === 0 ? -merged.floor : 0),
          y / merged.segments - offset,
          easeInExpo(x / merged.segments),
        )
      }
    }
    position.needsUpdate = true
    planeGeometry.computeVertexNormals()
  })

  return (
    <Entity from={Group} {...rest}>
      <Entity
        from={Mesh}
        receiveShadow={merged.receiveShadow}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      >
        <Entity
          from={PlaneGeometry}
          ref={planeGeometry}
          args={[1, 1, merged.segments, merged.segments]}
        />
        {merged.children}
      </Entity>
    </Entity>
  )
}
