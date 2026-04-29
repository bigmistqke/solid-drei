import { processProps, resolve, useRef } from '@/utils'
import type { Intersect } from '@/utils/types'
import type { JSXElement, Ref } from 'solid-js'
import { Show, createEffect, createMemo, merge, omit } from 'solid-js'
import { Entity, type S3 } from 'solid-three'
import { Mesh } from 'three'
import type { TextGeometryParameters } from 'three-stdlib'
import { Font, TextGeometry, mergeVertices } from 'three-stdlib'
import type { FontData } from './useFont'
import { useFont } from './useFont'

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

const TYPES = ['string', 'number']
function getTextFromChildren(children: any) {
  let label = ''
  const rest: JSXElement[] = []
  children.map(resolve).forEach((child: any) => {
    if (TYPES.includes(typeof child)) label += child + ''
    else rest.push(child)
  })
  return {
    label,
    rest,
  }
}

/**********************************************************************************/
/*                                                                                */
/*                                     Text 3D                                    */
/*                                                                                */
/**********************************************************************************/

interface Text3DProps extends Intersect<[Omit<TextGeometryParameters, 'font'>, S3.Props<Mesh>]> {
  ref?: Ref<Mesh>
  letterSpacing?: number
  lineHeight?: number
  font: FontData | string
  bevelSegments?: number
  smooth?: number
}

export function Text3D(props: Text3DProps) {
  const [config, rest] = processProps(
    props,
    {
      letterSpacing: 0,
      lineHeight: 1,
      size: 1,
      height: 0.2,
      bevelThickness: 0.1,
      bevelSize: 0.01,
      bevelEnabled: false,
      bevelOffset: 0,
      bevelSegments: 4,
      curveSegments: 8,
    },
    [
      'ref',
      'children',
      'font',
      'smooth',
      'letterSpacing',
      'lineHeight',
      'size',
      'height',
      'bevelThickness',
      'bevelSize',
      'bevelEnabled',
      'bevelOffset',
      'bevelSegments',
      'curveSegments',
    ],
  )
  const fontProps = omit(config, 'font')
  const options = merge(
    {
      get font() {
        return font()
      },
    },
    fontProps,
  )

  const mesh = new Mesh()
  const font = useFont(() => config.font)

  const memo = createMemo(() => getTextFromChildren(config.children))

  createEffect(
    () => config.smooth,
    (smooth) => {
      if (!smooth) return
      mesh.geometry = mergeVertices(mesh.geometry, smooth)
      mesh.geometry.computeVertexNormals()
    },
  )

  useRef(config, mesh)

  return (
    <Entity from={mesh} {...rest}>
      <Show when={options.font && options}>
        {options => (
          <Entity
            from={TextGeometry}
            args={[memo().label, options() as TextGeometryParameters & { font: Font }]}
          />
        )}
      </Show>
      {memo().rest}
    </Entity>
  )
}
