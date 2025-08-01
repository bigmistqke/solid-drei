import { ParentProps, createRenderEffect, createSignal, splitProps } from 'solid-js'
import { $S3C, S3, T } from 'solid-three'
import { BufferAttribute, BufferGeometry } from 'three'

interface ComputedAttributeProps extends ParentProps<S3.Props<'BufferAttribute'>> {
  compute: (geometry: BufferGeometry) => BufferAttribute
  name: string
}

/**
 * Used exclusively as a child of a BufferGeometry.
 * Computes the BufferAttribute by calling the `compute` function
 * and attaches the attribute to the geometry.
 */
export function ComputedAttribute(props: ComputedAttributeProps) {
  const [config, rest] = splitProps(props, ['compute', 'name'])

  const bufferAttribute = new BufferAttribute(new Float32Array(0), 1)

  const [primitive, setPrimitive] = createSignal<BufferAttribute>()

  createRenderEffect(() => {
    const parent = primitive()[$S3C]?.parent?.object
    if (!parent) return
    const attr = config.compute(parent)
    primitive()!.copy(attr)
  })

  return (
    <T.Primitive
      ref={setPrimitive}
      object={bufferAttribute}
      attach={`attributes-${config.name}`}
      {...rest}
    />
  )
}
