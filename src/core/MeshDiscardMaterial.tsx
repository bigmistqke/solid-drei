import { splitProps, type Ref } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { ShaderMaterial } from 'three'
import { DiscardMaterial } from '../materials/DiscardMaterial'

export function MeshDiscardMaterial(
  _props: S3.Props<typeof ShaderMaterial> & { ref: Ref<ShaderMaterial> },
) {
  const [props, rest] = splitProps(_props, ['args'])
  return <Entity from={DiscardMaterial} args={props.args} {...rest} />
}
