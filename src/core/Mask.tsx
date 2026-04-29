import { processProps, useRef } from '@/utils'
import { createRenderEffect } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import * as THREE from 'three'
import { Mesh } from 'three'

export type MaskProps = Omit<S3.Props<typeof Mesh>, 'id'> & {
  /** Each mask must have an id, you can have compound masks referring to the same id */
  id?: number
  /** If colors of the masks own material will leak through, default: false */
  colorWrite?: boolean
  /** If depth of the masks own material will leak through, default: false */
  depthWrite?: boolean
}

export function Mask(_props: MaskProps) {
  const [props, rest] = processProps(
    _props,
    { id: 1, colorWrite: false, depthWrite: false },
    ['ref', 'id', 'colorWrite', 'depthWrite', 'renderOrder'],
  )

  let ref: THREE.Mesh = null!
  useRef(_props, () => ref)

  createRenderEffect(
    () => ({ id: props.id, colorWrite: props.colorWrite, depthWrite: props.depthWrite }),
    ({ id, colorWrite, depthWrite }) => {
      if (!ref) return
      Object.assign(ref.material, {
        colorWrite,
        depthWrite,
        stencilWrite: true,
        stencilRef: id,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
      })
    }
  )

  return <Entity from={Mesh} ref={ref!} renderOrder={-props.id} {...(rest as any)} />
}

export function useMask(id: number, inverse = false) {
  return {
    stencilWrite: true,
    stencilRef: id,
    stencilFunc: inverse ? THREE.NotEqualStencilFunc : THREE.EqualStencilFunc,
    stencilFail: THREE.KeepStencilOp,
    stencilZFail: THREE.KeepStencilOp,
    stencilZPass: THREE.KeepStencilOp,
  }
}
