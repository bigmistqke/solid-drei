import type { ParentProps } from 'solid-js'
import { createRenderEffect, createSignal, omit } from 'solid-js'
import type { S3 } from 'solid-three'
import { $S3C, Entity } from 'solid-three'
import { BufferAttribute, BufferGeometry } from 'three'

interface ComputedAttributeProps extends ParentProps<S3.Props<BufferAttribute>> {
  compute: (geometry: BufferGeometry) => BufferAttribute
  name: string
}

/**
 * Used exclusively as a child of a BufferGeometry.
 * Computes the BufferAttribute by calling the `compute` function
 * and attaches the attribute to the geometry.
 */
export function ComputedAttribute(props: ComputedAttributeProps) {
  const rest = omit(props, 'compute', 'name')

  const bufferAttribute = new BufferAttribute(new Float32Array(0), 1)

  const [primitive, setPrimitive] = createSignal<S3.Meta<BufferAttribute>>()

  createRenderEffect(() => {
    const parent = primitive()?.[$S3C]?.parent?.object
    if (!parent) return
    const attr = props.compute(parent)
    primitive()!.copy(attr)
  })

  return (
    <Entity
      ref={setPrimitive}
      from={bufferAttribute}
      attach={`attributes-${props.name}`}
      {...rest}
    />
  )
}
