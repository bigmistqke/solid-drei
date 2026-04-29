import { processProps } from '@/utils'
import {
  For,
  Show,
  createMemo,
  type Accessor,
  type Component,
  type JSX,
  type JSXElement,
} from 'solid-js'
import { Entity, createEntity, type S3 } from 'solid-three'
import { Group, Mesh, Object3D } from 'three'
import { SkeletonUtils } from 'three-stdlib'

export type CloneProps = {
  /** Any pre-existing THREE.Object3D (groups, meshes, ...), or an array of objects */
  object: Object3D | Object3D[]
  children?: JSX.Element
  /** Can clone materials and/or geometries deeply (default: false) */
  deep?: boolean | 'materialsOnly' | 'geometriesOnly'
  /** The property keys it will shallow-clone (default: common mesh properties) */
  keys?: string[]
  /** Extra props or render function applied to every mesh within */
  inject?: S3.Props<typeof Mesh> | ((object: Object3D) => JSX.Element)
  castShadow?: boolean
  receiveShadow?: boolean
  isChild?: boolean
} & S3.Props<typeof Group>

const DEFAULT_KEYS = [
  'near',
  'far',
  'color',
  'distance',
  'decay',
  'penumbra',
  'angle',
  'intensity',
  'skeleton',
  'visible',
  'castShadow',
  'receiveShadow',
  'morphTargetDictionary',
  'morphTargetInfluences',
  'name',
  'geometry',
  'material',
  'position',
  'rotation',
  'scale',
  'up',
  'userData',
  'bindMode',
  'bindMatrix',
  'bindMatrixInverse',
]

function pickFromObject(obj: any, keys: string[]): Record<string, any> {
  return Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]))
}

function createSpread(
  child: Object3D,
  { keys = DEFAULT_KEYS, deep, inject, castShadow, receiveShadow }: Partial<CloneProps>,
) {
  let spread: Record<string, any> = pickFromObject(child, keys)
  if (deep) {
    if ((spread as any).geometry && deep !== 'materialsOnly')
      (spread as any).geometry = (spread as any).geometry.clone()
    if ((spread as any).material && deep !== 'geometriesOnly')
      (spread as any).material = (spread as any).material.clone()
  }
  if (inject) {
    if (typeof inject === 'function') spread = { ...spread, children: inject(child) }
    else spread = { ...spread, ...inject }
  }
  if (child instanceof Mesh) {
    if (castShadow) spread.castShadow = true
    if (receiveShadow) spread.receiveShadow = true
  }
  return spread
}

export function Clone(_props: CloneProps) {
  const [props, rest] = processProps(_props, { isChild: false }, [
    'ref',
    'isChild',
    'object',
    'children',
    'deep',
    'castShadow',
    'receiveShadow',
    'inject',
    'keys',
  ])

  const object = createMemo(() => {
    if (props.isChild === false && !Array.isArray(props.object)) {
      let isSkinned = false
      props.object.traverse(o => {
        if ((o as any).isSkinnedMesh) isSkinned = true
      })
      if (isSkinned) return SkeletonUtils.clone(props.object)
    }
    return props.object
  })

  const singleObj = createMemo(() => (!Array.isArray(object()) ? (object() as Object3D) : null))

  return (
    <Show
      when={singleObj()}
      keyed
      fallback={
        <Entity from={Group} ref={_props.ref as any} {...(rest as any)}>
          <For each={object() as Object3D[]}>
            {o => (
              <Clone
                object={o()}
                keys={props.keys}
                deep={props.deep}
                inject={props.inject}
                castShadow={props.castShadow}
                receiveShadow={props.receiveShadow}
              />
            )}
          </For>
          {props.children}
        </Entity>
      }
    >
      {(obj: Accessor<Object3D>) => {
        const { children: injectChildren, ...spread } = createSpread(obj(), {
          keys: props.keys,
          deep: props.deep,
          inject: props.inject,
          castShadow: props.castShadow,
          receiveShadow: props.receiveShadow,
        })
        const El = createEntity(obj().constructor as new (...args: any[]) => any) as Component<any>
        return (
          <El {...(spread as any)} {...(rest as any)} ref={_props.ref as any}>
            <For each={obj().children}>
              {child =>
                createMemo(() => {
                  const _child = child()

                  if ((_child as any).type === 'Bone') {
                    return <Entity from={_child} />
                  }

                  return (
                    <Clone
                      object={_child}
                      keys={props.keys}
                      deep={props.deep}
                      inject={props.inject}
                      castShadow={props.castShadow}
                      receiveShadow={props.receiveShadow}
                      isChild
                    />
                  )
                }) as unknown as JSXElement
              }
            </For>
            {props.children}
            {injectChildren}
          </El>
        )
      }}
    </Show>
  )
}
