import { Ref } from 'solid-js'
import { extend, S3, T } from 'solid-three'
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
