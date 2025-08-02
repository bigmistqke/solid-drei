import { Show, createEffect, createMemo, mergeProps, splitProps } from 'solid-js'
import type { JSXElement, Ref } from 'solid-js'
import { T, extend } from 'solid-three'
import type { S3 } from 'solid-three'
import { Mesh } from 'three'
import { TextGeometry, mergeVertices } from 'three-stdlib'
import type { TextGeometryParameters } from 'three-stdlib'
import { processProps } from '@/utils/process-props'
import { resolveAccessor } from '@/utils/resolve-accessor'
import { useFont } from './useFont'
import type { FontData } from './useFont'

declare global {
  namespace SolidThree {
    interface Elements {
      RenamedTextGeometry: TextGeometry
    }
  }
}

extend({ RenamedTextGeometry: TextGeometry })

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

const TYPES = ['string', 'number']
function getTextFromChildren(children: any) {
  let label = ''
  const rest: JSXElement[] = []
  children.map(resolveAccessor).forEach((child: any) => {
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

type Text3DPropsBase = Omit<TextGeometryParameters, 'font'> & S3.Props<'Mesh'>
interface Text3DProps extends Text3DPropsBase {
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
  const [, fontProps] = splitProps(config, ['font'])
  const options = mergeProps(
    {
      get font() {
        return font()
      },
    },
    fontProps,
  )

  let mesh: Mesh
  const font = useFont(() => config.font)

  const memo = createMemo(() => getTextFromChildren(config.children))

  createEffect(() => {
    if (!config.smooth) return
    mesh.geometry = mergeVertices(mesh.geometry, config.smooth)
    mesh.geometry.computeVertexNormals()
  })

  createEffect(() => {
    if (typeof config.ref === 'function') config.ref(mesh)
    else config.ref = mesh
  })

  return (
    <T.Mesh {...rest} ref={mesh!}>
      <Show when={options.font}>
        <T.RenamedTextGeometry args={[memo().label, options]} />
      </Show>
      {memo().rest}
    </T.Mesh>
  )
}
