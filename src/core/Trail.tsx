import { createWritable, defaultProps, resolve } from '@/utils'
import { check, when } from '@/utils/conditionals'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import {
  type Accessor,
  children,
  createMemo,
  createRenderEffect,
  merge,
  type ParentProps,
} from 'solid-js'
import { Entity, Portal, useFrame, useThree, type S3 } from 'solid-three'
import { type ColorRepresentation, Group, Mesh, Object3D, Vector2, Vector3 } from 'three'

type TrailOptions = {
  width: number
  length: number
  decay: number
  /**
   * Wether to use the target's world or local positions
   */
  local: boolean
  // Min distance between previous and current points
  stride: number
  // Number of frames to wait before next calculation
  interval: number
}

type TrailProps = {
  color?: ColorRepresentation
  attenuation?: (width: number) => number
  target?: Object3D
} & Partial<TrailOptions>

const defaults = {
  width: 0.2,
  length: 1,
  decay: 1,
  local: false,
  stride: 0,
  interval: 1,
}

const shiftLeft = (collection: Float32Array, steps = 1): Float32Array => {
  collection.set(collection.subarray(steps))
  collection.fill(-Infinity, -steps)
  return collection
}

export function useTrail(
  target: Object3D | Accessor<Object3D | undefined>,
  options: Partial<TrailOptions>,
) {
  const config = merge(defaults, options)

  const [points, setPoints] = createWritable<Float32Array>(
    () => {
      const _target = resolve(target)
      return new Float32Array(
        (function* () {
          if (!_target) return
          for (let i = 0; i < config.length * 10 * 3; i++) {
            yield _target?.position.getComponent(i % 3)
          }
        })(),
      )
    },
    { equals: false },
  )

  const worldPosition = new Vector3()
  const prevPosition = new Vector3()
  let frameCount = 0

  useFrame(() => {
    const _target = resolve(target)
    const _points = resolve(points)

    if (!_target || !_points) return

    if (frameCount === 0) {
      let newPosition: Vector3
      if (config.local) {
        newPosition = _target.position
      } else {
        _target.getWorldPosition(worldPosition)
        newPosition = worldPosition
      }

      const steps = 1 * config.decay
      for (let i = 0; i < steps; i++) {
        if (newPosition.distanceTo(prevPosition) < config.stride) continue

        shiftLeft(_points, 3)

        setPoints(points => {
          points!.set(newPosition.toArray(), points!.length - 3)
          return points
        })
      }
      prevPosition.copy(newPosition)
    }
    frameCount++
    frameCount = frameCount % config.interval
  })

  return points
}

export function Trail(
  props: ParentProps<
    TrailProps & {
      ref?: (Mesh & MeshLineGeometry) | ((value: S3.Meta<Mesh & MeshLineGeometry>) => void)
    }
  >,
) {
  const config = defaultProps(props, { ...defaults, color: 'hotpink' })

  const store = useThree()
  const group = new Group()
  const geometry = new MeshLineGeometry()
  const childs = children(() => config.children)

  const anchor = createMemo<Object3D | undefined>(previous => {
    const t =
      config.target ||
      childs.toArray().find(o => {
        return o instanceof Object3D
      })
    return t ?? previous
  })

  const points = useTrail(anchor, {
    length: config.length,
    decay: config.decay,
    local: config.local,
    stride: config.stride,
    interval: config.interval,
  })

  const mat = createMemo(() => {
    if (store.bounds.width === 0 || store.bounds.height === 0) return undefined
    const m = new MeshLineMaterial({
      lineWidth: 0.1 * config.width,
      color: config.color,
      sizeAttenuation: 1,
      resolution: new Vector2(store.bounds.width, store.bounds.height),
    })

    // Get and apply first <T.MeshLineMaterial /> from children
    let matOverride
    check(childs, children => {
      if (children) {
        if (Array.isArray(children)) {
          matOverride = children.find((child: any) => {
            if (typeof child === 'function') {
              const c = child()
              return typeof c.type === 'string' && c.type === 'meshLineMaterial'
            }
          })
        } else {
          if (typeof children === 'function') {
            const c = (children as any)()
            if (typeof c.type === 'string' && c.type === 'meshLineMaterial') {
              matOverride = c
            }
          }
        }
      }
    })

    // if (typeof matOverride?.props === 'object') {
    //   m.setValues(matOverride.props)
    // }

    return m
  })

  createRenderEffect(
    () => [store.bounds.width, store.bounds.height] as const,
    () => {
      mat()?.uniforms.resolution.value.set(store.bounds.width, store.bounds.height)
    },
  )

  useFrame(
    when(points, points => {
      geometry.setPoints(points, config.attenuation)
    }),
  )

  return (
    <Entity from={new Group()}>
      <Portal element={store.scene}>
        <Entity
          from={new Mesh()}
          ref={config.ref as Mesh | ((value: S3.Meta<Mesh>) => void) | undefined}
          geometry={geometry}
          material={mat()}
        />
      </Portal>
      <Entity from={group}>{childs()}</Entity>
    </Entity>
  )
}
