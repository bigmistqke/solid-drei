import { processProps } from '@/utils/process-props'
import { Show, createEffect, createMemo, onCleanup, onMount } from 'solid-js'
import { Entity, createT } from 'solid-three'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Line,
  Material,
  Mesh,
  Object3D,
  Points,
  WireframeGeometry,
} from 'three'
import type { WireframeMaterialProps } from '../materials/WireframeMaterial'
import {
  WireframeMaterial,
  WireframeMaterialShaders,
  setWireframeOverride,
  useWireframeUniforms,
} from '../materials/WireframeMaterial'

const T = createT({ MeshWireframeMaterial: WireframeMaterial, Mesh, Object3D })

interface WireframeProps {
  geometry?: BufferGeometry
  simplify?: boolean
}

type WithGeometry =
  | Mesh<BufferGeometry, Material>
  | Line<BufferGeometry, Material>
  | Points<BufferGeometry, Material>

function isWithGeometry(object?: Object3D | null): object is WithGeometry {
  return !!(object as Mesh)?.geometry
}

function isGeometry(object?: any | null): object is BufferGeometry {
  return !!(object as BufferGeometry)?.isBufferGeometry
}

function isWireframeGeometry(geometry: any): geometry is WireframeGeometry {
  return (geometry as WireframeGeometry)?.type === 'WireframeGeometry'
}

function getUniforms() {
  const u = {} as {
    [TKey in keyof (typeof WireframeMaterialShaders)['uniforms']]: {
      value: (typeof WireframeMaterialShaders)['uniforms'][TKey]
    }
  }
  for (const key in WireframeMaterialShaders.uniforms) {
    u[key] = { value: WireframeMaterialShaders.uniforms[key] }
  }
  return u
}

function getBarycentricCoordinates(geometry: BufferGeometry, removeEdge?: boolean) {
  const position = geometry.getAttribute('position')
  const count = position.count

  const barycentric: number[] = []

  for (let i = 0; i < count; i++) {
    const even = i % 2 === 0
    const Q = removeEdge ? 1 : 0
    if (even) {
      barycentric.push(0, 0, 1, 0, 1, 0, 1, 0, Q)
    } else {
      barycentric.push(0, 1, 0, 0, 0, 1, 1, 0, Q)
    }
  }

  return new BufferAttribute(Float32Array.from(barycentric), 3)
}

function getInputGeometry(geo: BufferGeometry | Object3D) {
  if (!isGeometry(geo)) {
    // Disallow WireframeGeometry
    if (isWireframeGeometry(geo)) {
      throw new Error('Wireframe: WireframeGeometry is not supported.')
    }

    const parent = geo.parent
    if (isWithGeometry(parent)) {
      // Disallow WireframeGeometry
      if (isWireframeGeometry(parent.geometry)) {
        throw new Error('Wireframe: WireframeGeometry is not supported.')
      }

      return parent.geometry
    }
  } else {
    return geo
  }
}

function setBarycentricCoordinates(geometry: BufferGeometry, simplify: boolean) {
  if (geometry.index) {
    console.warn('Wireframe: Requires non-indexed geometry, converting to non-indexed geometry.')
    const nonIndexedGeo = geometry.toNonIndexed()

    geometry.copy(nonIndexedGeo)
    geometry.setIndex(null)
  }

  const newBarycentric = getBarycentricCoordinates(geometry, simplify)

  geometry.setAttribute('barycentric', newBarycentric)
}

function WireframeWithCustomGeo(props: WireframeProps & WireframeMaterialProps) {
  const [config, rest] = processProps(
    props,
    {
      simplify: false,
    },
    ['simplify', 'geometry'],
  )

  const geometry = createMemo(() => {
    const geometry = getInputGeometry(config.geometry)

    if (!geometry) {
      throw new Error(
        'Wireframe: geometry prop must be a BufferGeometry or a ref to a BufferGeometry.',
      )
    }

    setBarycentricCoordinates(geometry, config.simplify)

    return geometry
  })

  return (
    <Show when={geometry()}>
      {drawnGeo => (
        <T.Mesh geometry={drawnGeo()}>
          <T.MeshWireframeMaterial
            attach="material"
            transparent
            side={DoubleSide}
            polygonOffset={true} //
            polygonOffsetFactor={-4}
            {...rest}
            extensions={{
              derivatives: true,
              fragDepth: false,
              drawBuffers: false,
              shaderTextureLOD: false,
            }}
          />
        </T.Mesh>
      )}
    </Show>
  )
}

function WireframeWithoutCustomGeo(
  _props: Omit<WireframeProps, 'geometry'> & WireframeMaterialProps,
) {
  const [props, rest] = processProps(_props, { simplify: false }, ['simplify'])

  const object3d = new Object3D()

  const uniforms = createMemo(getUniforms)
  useWireframeUniforms(uniforms, rest)

  createEffect(() => {
    const geometry = getInputGeometry(object3d)

    if (!geometry) {
      throw new Error(
        'Wireframe: Must be a child of a Mesh, Line or Points object or specify a geometry prop.',
      )
    }
    const original = geometry.clone()

    setBarycentricCoordinates(geometry, props.simplify)

    onCleanup(() => {
      geometry.copy(original)
      original.dispose()
    })
  })

  onMount(() => {
    const parentMesh = object3d.parent as Mesh<BufferGeometry, Material>
    const og = parentMesh.material.clone()

    setWireframeOverride(parentMesh.material, uniforms)
    onCleanup(() => {
      parentMesh.material.dispose()
      parentMesh.material = og
    })
  })

  return <Entity from={object3d} />
}

export function Wireframe(props: WireframeProps & WireframeMaterialProps) {
  return (
    <Show when={props.geometry} fallback={<WireframeWithoutCustomGeo {...props} />}>
      <WireframeWithCustomGeo geometry={props.geometry} {...props} />
    </Show>
  )
}
