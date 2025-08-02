import { S3, T, extend } from 'solid-three'

import {
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import * as THREE from 'three'
import {
  WireframeMaterial,
  WireframeMaterialProps,
  WireframeMaterialShaders,
  setWireframeOverride,
  useWireframeUniforms,
} from '../../materials/WireframeMaterial.tsx'
import { processProps } from '../../utils/process-props.ts'

declare global {
  namespace SolidThree {
    interface Elements {
      MeshWireframeMaterial: S3.Props<'ShaderMaterial'> & WireframeMaterialProps
    }
  }
}

extend({ MeshWireframeMaterial: WireframeMaterial })

interface WireframeProps {
  geometry?: THREE.BufferGeometry
  simplify?: boolean
}

type WithGeometry =
  | THREE.Mesh<THREE.BufferGeometry, THREE.Material>
  | THREE.Line<THREE.BufferGeometry, THREE.Material>
  | THREE.Points<THREE.BufferGeometry, THREE.Material>

function isWithGeometry(object?: THREE.Object3D | null): object is WithGeometry {
  return !!(object as THREE.Mesh)?.geometry
}

function isGeometry(object?: any | null): object is THREE.BufferGeometry {
  return !!(object as THREE.BufferGeometry)?.isBufferGeometry
}

function isWireframeGeometry(geometry: any): geometry is THREE.WireframeGeometry {
  return (geometry as THREE.WireframeGeometry)?.type === 'WireframeGeometry'
}

function getUniforms() {
  const u = {}
  for (const key in WireframeMaterialShaders.uniforms) {
    u[key] = { value: WireframeMaterialShaders.uniforms[key] }
  }
  return u
}

function getBarycentricCoordinates(geometry: THREE.BufferGeometry, removeEdge?: boolean) {
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

  return new THREE.BufferAttribute(Float32Array.from(barycentric), 3)
}

function getInputGeometry(inputGeometry: THREE.BufferGeometry | THREE.Object3D) {
  const geo = inputGeometry // (isRefObject(inputGeometry) ? inputGeometry.current : inputGeometry)!

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

function setBarycentricCoordinates(geometry: THREE.BufferGeometry, simplify: boolean) {
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

  const [geometry, setGeometry] = createSignal<THREE.BufferGeometry>(null!)

  createRenderEffect(() => {
    const geom = getInputGeometry(config.geometry)

    if (!geom) {
      throw new Error(
        'Wireframe: geometry prop must be a BufferGeometry or a ref to a BufferGeometry.',
      )
    }

    setBarycentricCoordinates(geom, config.simplify)

    // if (isRef(props.geometry)) {
    setGeometry(geom)
    // }
  })

  const drawnGeo = () => (isRef(config.geometry) ? geometry : config.geometry)

  return (
    <Show when={drawnGeo()}>
      {drawnGeo => (
        <T.Mesh geometry={drawnGeo()}>
          <T.MeshWireframeMaterial
            attach="material"
            transparent
            side={THREE.DoubleSide}
            polygonOffset //
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

  let objectRef: THREE.Object3D = null!
  const uniforms = createMemo(() => getUniforms(), [WireframeMaterialShaders.uniforms])
  useWireframeUniforms(uniforms, rest)

  createEffect(() => {
    const geom = getInputGeometry(objectRef)

    if (!geom) {
      throw new Error(
        'Wireframe: Must be a child of a Mesh, Line or Points object or specify a geometry prop.',
      )
    }
    const og = geom.clone()

    setBarycentricCoordinates(geom, props.simplify)

    onCleanup(() => {
      geom.copy(og)
      og.dispose()
    })
  })

  // s3f:   was originally `React.useLayoutEffect` but with `createRenderEffect` objectRef would not be defined yet.
  onMount(() => {
    const parentMesh = objectRef.parent as THREE.Mesh<THREE.BufferGeometry, THREE.Material>
    const og = parentMesh.material.clone()

    setWireframeOverride(parentMesh.material, uniforms)
    onCleanup(() => {
      parentMesh.material.dispose()
      parentMesh.material = og
    })
  })

  return <T.Object3D ref={objectRef} />
}

export function Wireframe({
  geometry: customGeometry,
  ...props
}: WireframeProps & WireframeMaterialProps) {
  if (customGeometry) {
    return <WireframeWithCustomGeo geometry={customGeometry} {...props} />
  }

  return <WireframeWithoutCustomGeo {...props} />
}
