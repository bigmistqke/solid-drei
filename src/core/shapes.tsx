import { useRef } from '@/utils'
import type { Args } from '@/utils/types'
import type { Ref } from 'solid-js'
import { onMount, splitProps, type JSX } from 'solid-js'
import { autodispose, Entity, type S3 } from 'solid-three'
import {
  Box3,
  BoxGeometry,
  BufferAttribute,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  OctahedronGeometry,
  PlaneGeometry,
  PolyhedronGeometry,
  RingGeometry,
  ShapeGeometry,
  SphereGeometry,
  TetrahedronGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  TubeGeometry,
  Vector3,
} from 'three'

type GeometryKind =
  | typeof BoxGeometry
  | typeof CircleGeometry
  | typeof ConeGeometry
  | typeof CylinderGeometry
  | typeof SphereGeometry
  | typeof PlaneGeometry
  | typeof TubeGeometry
  | typeof TorusGeometry
  | typeof TorusKnotGeometry
  | typeof TetrahedronGeometry
  | typeof RingGeometry
  | typeof PolyhedronGeometry
  | typeof IcosahedronGeometry
  | typeof OctahedronGeometry
  | typeof DodecahedronGeometry
  | typeof ExtrudeGeometry
  | typeof LatheGeometry
  | typeof CapsuleGeometry
  | typeof ShapeGeometry

export interface ShapeProps<T> extends Omit<S3.Props<typeof Mesh>, 'children' | 'args'> {
  args?: Args<T>
  children?: JSX.Element | JSX.Element[]
}
interface GeometryProps<T extends GeometryKind> extends Omit<S3.Props<typeof Mesh>, 'args'> {
  ref?: Ref<Mesh>
  args?: S3.Props<T>['args']
}

function create<TKind extends GeometryKind>(Geometry: GeometryKind, effect?: (mesh: Mesh) => void) {
  return function Shape(props: GeometryProps<TKind>) {
    const [config, rest] = splitProps(props, ['args', 'children', 'ref'])

    const mesh = new Mesh()

    onMount(() => effect?.(mesh))

    useRef(props, mesh)

    return (
      <Entity from={mesh} {...rest}>
        <Entity from={autodispose(new Geometry(...(config.args ?? [])))} attach="geometry" />
        {config.children}
      </Entity>
    )
  }
}

/**
 * Creates a box-shaped mesh using `BoxGeometry`.
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
export const Box = create(BoxGeometry)

/**
 * Creates a circle-shaped mesh using `CircleGeometry`.
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
export const Circle = create(CircleGeometry)

/**
 * Creates a cone-shaped mesh using `ConeGeometry`.
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
export const Cone = create(ConeGeometry)

/**
 * Creates a cylinder-shaped mesh using `CylinderGeometry`.
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
export const Cylinder = create(CylinderGeometry)

/**
 * Creates a sphere-shaped mesh using `SphereGeometry`.
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
export const Sphere = create(SphereGeometry)

/**
 * Creates a plane-shaped mesh using `PlaneGeometry`.
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
export const Plane = create(PlaneGeometry)

/**
 * Creates a tube-shaped mesh using `TubeGeometry`.
 *
 * @example
 * export default () => {
 *   const path = new CurvePath();
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
export const Tube = create(TubeGeometry)

/**
 * Creates a torus-shaped mesh using `TorusGeometry`.
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
export const Torus = create(TorusGeometry)

/**
 * Creates a torus knot-shaped mesh using `TorusKnotGeometry`.
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
export const TorusKnot = create(TorusKnotGeometry)

/**
 * Creates a tetrahedron-shaped mesh using `TetrahedronGeometry`.
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
export const Tetrahedron = create(TetrahedronGeometry)

/**
 * Creates a ring-shaped mesh using `RingGeometry`.
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
export const Ring = create(RingGeometry)

/**
 * Creates a polyhedron-shaped mesh using `PolyhedronGeometry`.
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
export const Polyhedron = create(PolyhedronGeometry)

/**
 * Creates an icosahedron-shaped mesh using `IcosahedronGeometry`.
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
export const Icosahedron = create(IcosahedronGeometry)

/**
 * Creates an octahedron-shaped mesh using `OctahedronGeometry`.
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
export const Octahedron = create(OctahedronGeometry)

/**
 * Creates a dodecahedron-shaped mesh using `DodecahedronGeometry`.
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
export const Dodecahedron = create(DodecahedronGeometry)

/**
 * Creates an extrude-shaped mesh using `ExtrudeGeometry`.
 *
 * @example
 * export default () => {
 *   const shape = new Shape();
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
export const Extrude = create(ExtrudeGeometry)

/**
 * Creates a lathe-shaped mesh using `LatheGeometry`.
 *
 * @example
 * export default () => {
 *   const points = Array.from({ length: 10 }, (_, i) => (
 *     new Vector2(Math.sin(i * 0.2) * 10 + 10, (i - 5) * 2)
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
export const Lathe = create(LatheGeometry)

/**
 * Creates a capsule-shaped mesh using `CapsuleGeometry`.
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
export const Capsule = create(CapsuleGeometry)

/**
 * Creates a custom shape mesh using `ShapeGeometry`.
 *
 * @example
 * export default () => {
 *   const shape = new Shape();
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
export const Shape = create(ShapeGeometry, ({ geometry }) => {
  // Calculate UVs (by https://discourse.threejs.org/u/prisoner849)
  // https://discourse.threejs.org/t/custom-shape-in-image-not-working/49348/10
  const pos = geometry.attributes.position as BufferAttribute
  const b3 = new Box3().setFromBufferAttribute(pos)
  const b3size = new Vector3()
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
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
})
