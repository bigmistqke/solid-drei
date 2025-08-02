import type { Ref } from 'solid-js'
import { extend, T } from 'solid-three'
import type { S3 } from 'solid-three'
import { ShaderMaterial } from 'three'
import { DiscardMaterial as DiscardMaterialImpl } from '../materials/DiscardMaterial'

declare global {
  namespace SolidThree {
    interface Elements {
      DiscardMaterialImpl: ShaderMaterial
    }
  }
}

export function MeshDiscardMaterial(
  props: S3.Props<'ShaderMaterial'> & { ref: Ref<ShaderMaterial> },
) {
  extend({ DiscardMaterialImpl })
  return <T.DiscardMaterialImpl {...props} />
}
