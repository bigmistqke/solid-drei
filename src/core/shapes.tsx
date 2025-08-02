import type { Args } from '@/utils/type-utils'
import { onMount, splitProps, type JSX } from 'solid-js'
import type { Ref } from 'solid-js'
import { T } from 'solid-three'
import type { S3 } from 'solid-three'
import * as THREE from 'three'

export interface ShapeProps<T> extends Omit<S3.Props<'Mesh'>, 'children' | 'args'> {
  args?: Args<T>
  children?: JSX.Element | JSX.Element[]
}
interface GeometryProps<TKind extends ShapeKinds> extends S3.Props<'Mesh'> {
  ref?: Ref<(typeof THREE)[`${TKind}Geometry`]>
}

function create<TKind extends ShapeKinds>(type: TKind, effect?: (mesh: THREE.Mesh) => void) {
  return (props: GeometryProps<TKind>) => {
    const [config, rest] = splitProps(props, ['args', 'children', 'ref'])
    let mesh: THREE.Mesh

    onMount(() => effect?.(mesh))

    const Component = T[`${type}Geometry`]

    return (
      <T.Mesh ref={mesh!} {...rest}>
        {/* @ts-expect-error */}
        <Component attach="geometry" args={config.args as any} />
        {config.children}
      </T.Mesh>
    )
  }
}

type ShapeKinds =
  | 'Box'
  | 'Circle'
  | 'Cone'
  | 'Cylinder'
  | 'Sphere'
  | 'Plane'
  | 'Tube'
  | 'Torus'
  | 'TorusKnot'
  | 'Tetrahedron'
  | 'Ring'
  | 'Polyhedron'
  | 'Icosahedron'
  | 'Octahedron'
  | 'Dodecahedron'
  | 'Extrude'
  | 'Lathe'
  | 'Capsule'
  | 'Shape'

/**
 * Creates a box-shaped mesh using `THREE.BoxGeometry`.
 *
 * @example
 * export default () => {
 *   const width = 1;
 *   const height = 1;
 *   const depth = 1;
 *   return (
 *     <Box args={[width, height, depth]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="orange" />
 *     </Box>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/BoxGeometry
 */
export const Box = create('Box')

/**
 * Creates a circle-shaped mesh using `THREE.CircleGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const segments = 32;
 *   return (
 *     <Circle args={[radius, segments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="blue" />
 *     </Circle>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/CircleGeometry
 */
export const Circle = create('Circle')

/**
 * Creates a cone-shaped mesh using `THREE.ConeGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const height = 2;
 *   const radialSegments = 32;
 *   return (
 *     <Cone args={[radius, height, radialSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="red" />
 *     </Cone>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/ConeGeometry
 */
export const Cone = create('Cone')

/**
 * Creates a cylinder-shaped mesh using `THREE.CylinderGeometry`.
 *
 * @example
 * export default () => {
 *   const radiusTop = 1;
 *   const radiusBottom = 1;
 *   const height = 2;
 *   const radialSegments = 32;
 *   return (
 *     <Cylinder args={[radiusTop, radiusBottom, height, radialSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="green" />
 *     </Cylinder>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/CylinderGeometry
 */
export const Cylinder = create('Cylinder')

/**
 * Creates a sphere-shaped mesh using `THREE.SphereGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const widthSegments = 32;
 *   const heightSegments = 32;
 *   return (
 *     <Sphere args={[radius, widthSegments, heightSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="yellow" />
 *     </Sphere>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/SphereGeometry
 */
export const Sphere = create('Sphere')

/**
 * Creates a plane-shaped mesh using `THREE.PlaneGeometry`.
 *
 * @example
 * export default () => {
 *   const width = 1;
 *   const height = 1;
 *   return (
 *     <Plane args={[width, height]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="gray" />
 *     </Plane>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/PlaneGeometry
 */
export const Plane = create('Plane')

/**
 * Creates a tube-shaped mesh using `THREE.TubeGeometry`.
 *
 * @example
 * export default () => {
 *   const path = new THREE.CurvePath();
 *   const tubularSegments = 20;
 *   const radius = 2;
 *   const radialSegments = 8;
 *   const closed = false;
 *   return (
 *     <Tube args={[path, tubularSegments, radius, radialSegments, closed]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="purple" />
 *     </Tube>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/TubeGeometry
 */
export const Tube = create('Tube')

/**
 * Creates a torus-shaped mesh using `THREE.TorusGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const tube = 0.4;
 *   const radialSegments = 16;
 *   const tubularSegments = 100;
 *   return (
 *     <Torus args={[radius, tube, radialSegments, tubularSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="cyan" />
 *     </Torus>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/TorusGeometry
 */
export const Torus = create('Torus')

/**
 * Creates a torus knot-shaped mesh using `THREE.TorusKnotGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const tube = 0.4;
 *   const tubularSegments = 100;
 *   const radialSegments = 16;
 *   return (
 *     <TorusKnot args={[radius, tube, tubularSegments, radialSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="magenta" />
 *     </TorusKnot>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/TorusKnotGeometry
 */
export const TorusKnot = create('TorusKnot')

/**
 * Creates a tetrahedron-shaped mesh using `THREE.TetrahedronGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const detail = 0;
 *   return (
 *     <Tetrahedron args={[radius, detail]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="pink" />
 *     </Tetrahedron>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/TetrahedronGeometry
 */
export const Tetrahedron = create('Tetrahedron')

/**
 * Creates a ring-shaped mesh using `THREE.RingGeometry`.
 *
 * @example
 * export default () => {
 *   const innerRadius = 0.5;
 *   const outerRadius = 1;
 *   const thetaSegments = 32;
 *   return (
 *     <Ring args={[innerRadius, outerRadius, thetaSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="lime" />
 *     </Ring>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/RingGeometry
 */
export const Ring = create('Ring')

/**
 * Creates a polyhedron-shaped mesh using `THREE.PolyhedronGeometry`.
 *
 * @example
 * export default () => {
 *   const vertices = [
 *     1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1,
 *     1, 1, -1, -1, 1, 1, -1, -1, -1, 1, -1, 1
 *   ];
 *   const indices = [
 *     2, 1, 0, 0, 3, 2, 0, 4, 7, 7, 3, 0, 0, 1, 4,
 *     4, 5, 7, 7, 6, 2, 7, 2, 3, 7, 5, 6, 4, 6, 5,
 *     6, 1, 2, 5, 1, 6, 1, 5, 4
 *   ];
 *   const radius = 6;
 *   const detail = 2;
 *   return (
 *     <Polyhedron args={[vertices, indices, radius, detail]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="maroon" />
 *     </Polyhedron>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry
 */
export const Polyhedron = create('Polyhedron')

/**
 * Creates an icosahedron-shaped mesh using `THREE.IcosahedronGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const detail = 0;
 *   return (
 *     <Icosahedron args={[radius, detail]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="navy" />
 *     </Icosahedron>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry
 */
export const Icosahedron = create('Icosahedron')

/**
 * Creates an octahedron-shaped mesh using `THREE.OctahedronGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const detail = 0;
 *   return (
 *     <Octahedron args={[radius, detail]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="teal" />
 *     </Octahedron>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/OctahedronGeometry
 */
export const Octahedron = create('Octahedron')

/**
 * Creates a dodecahedron-shaped mesh using `THREE.DodecahedronGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const detail = 0;
 *   return (
 *     <Dodecahedron args={[radius, detail]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="olive" />
 *     </Dodecahedron>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/DodecahedronGeometry
 */
export const Dodecahedron = create('Dodecahedron')

/**
 * Creates an extrude-shaped mesh using `THREE.ExtrudeGeometry`.
 *
 * @example
 * export default () => {
 *   const shape = new THREE.Shape();
 *   shape.moveTo(0, 0);
 *   shape.lineTo(0, 1);
 *   shape.lineTo(1, 1);
 *   shape.lineTo(1, 0);
 *   shape.lineTo(0, 0);
 *
 *   const extrudeSettings = {
 *     steps: 2,
 *     depth: 0.5,
 *     bevelEnabled: true,
 *     bevelThickness: 0.1,
 *     bevelSize: 0.1,
 *     bevelOffset: 0,
 *     bevelSegments: 1
 *   };
 *
 *   return (
 *     <Extrude args={[shape, extrudeSettings]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="silver" />
 *     </Extrude>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry
 */
export const Extrude = create('Extrude')

/**
 * Creates a lathe-shaped mesh using `THREE.LatheGeometry`.
 *
 * @example
 * export default () => {
 *   const points = Array.from({ length: 10 }, (_, i) => (
 *     new THREE.Vector2(Math.sin(i * 0.2) * 10 + 10, (i - 5) * 2)
 *   ));
 *   return (
 *     <Lathe args={[points]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="gold" />
 *     </Lathe>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/LatheGeometry
 */
export const Lathe = create('Lathe')

/**
 * Creates a capsule-shaped mesh using `THREE.CapsuleGeometry`.
 *
 * @example
 * export default () => {
 *   const radius = 1;
 *   const length = 2;
 *   const capSegments = 8;
 *   const radialSegments = 16;
 *   return (
 *     <Capsule args={[radius, length, capSegments, radialSegments]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="aqua" />
 *     </Capsule>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/CapsuleGeometry
 */
export const Capsule = create('Capsule')

/**
 * Creates a custom shape mesh using `THREE.ShapeGeometry`.
 *
 * @example
 * export default () => {
 *   const shape = new THREE.Shape();
 *   shape.moveTo(0, 0);
 *   shape.lineTo(0, 1);
 *   shape.lineTo(1, 1);
 *   shape.lineTo(1, 0);
 *   shape.lineTo(0, 0);
 *   return (
 *     <Shape args={[shape]} position={[0, 0, 0]}>
 *       <T.MeshBasicMaterial color="chocolate" />
 *     </Shape>
 *   );
 * }
 *
 * @note
 * A material must be included as a child for the mesh to be visible in the scene.
 *
 * @link https://threejs.org/docs/#api/en/geometries/ShapeGeometry
 */
export const Shape = create('Shape', ({ geometry }) => {
  // Calculate UVs (by https://discourse.threejs.org/u/prisoner849)
  // https://discourse.threejs.org/t/custom-shape-in-image-not-working/49348/10
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const b3 = new THREE.Box3().setFromBufferAttribute(pos)
  const b3size = new THREE.Vector3()
  b3.getSize(b3size)
  const uv: number[] = []
  let x = 0,
    y = 0,
    u = 0,
    v = 0
  for (let i = 0; i < pos.count; i++) {
    x = pos.getX(i)
    y = pos.getY(i)
    u = (x - b3.min.x) / b3size.x
    v = (y - b3.min.y) / b3size.y
    uv.push(u, v)
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
})
