/** Based on
      https://github.com/Fyrestar/THREE.InfiniteGridHelper by https://github.com/Fyrestar
      and https://github.com/threlte/threlte/blob/main/packages/extras/src/lib/components/Grid/Grid.svelte
        by https://github.com/grischaerbe and https://github.com/jerzakm
*/

import { T, ThreeProps, extend, useFrame } from '@solid-three/fiber'
import { splitProps } from 'solid-js'
import * as THREE from 'three'
import { createRef } from '../helpers/createRef'
import { mergeRefs } from '../helpers/mergeRefs'
import { processProps } from '../helpers/processProps'
import { RefComponent } from '../helpers/typeHelpers'
import { shaderMaterial } from './shaderMaterial'

export type GridMaterialType = {
  /** Cell size, default: 0.5 */
  cellSize?: number
  /** Cell thickness, default: 0.5 */
  cellThickness?: number
  /** Cell color, default: black */
  cellColor?: THREE.ColorRepresentation
  /** Section size, default: 1 */
  sectionSize?: number
  /** Section thickness, default: 1 */
  sectionThickness?: number
  /** Section color, default: #2080ff */
  sectionColor?: THREE.ColorRepresentation
  /** Follow camera, default: false */
  followCamera?: boolean
  /** Display the grid infinitely, default: false */
  infiniteGrid?: boolean
  /** Fade distance, default: 100 */
  fadeDistance?: number
  /** Fade strength, default: 1 */
  fadeStrength?: number
  /** Material side, default: THREE.BackSide */
  side?: THREE.Side
}

export type GridProps = GridMaterialType & {
  /** Default plane-geometry arguments */
  args?: ConstructorParameters<typeof THREE.PlaneGeometry>
}

declare global {
  namespace SolidThree {
    interface IntrinsicElements {
      GridMaterial: ThreeProps<'ShaderMaterial'> & GridMaterialType
    }
  }
}

const GridMaterial = shaderMaterial(
  {
    cellSize: 0.5,
    sectionSize: 1,
    fadeDistance: 100,
    fadeStrength: 1,
    cellThickness: 0.5,
    sectionThickness: 1,
    cellColor: new THREE.Color(),
    sectionColor: new THREE.Color(),
    infiniteGrid: false,
    followCamera: false,
    worldCamProjPosition: new THREE.Vector3(),
    worldPlanePosition: new THREE.Vector3(),
  },
  /* glsl */ `
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  /* glsl */ `
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float cellThickness;
    uniform float sectionThickness;

    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      float line = min(grid.x, grid.y) + 1.0 - thickness;
      return 1.0 - min(line, 1.0);
    }

    void main() {
      float g1 = getGrid(cellSize, cellThickness);
      float g2 = getGrid(sectionSize, sectionThickness);

      float dist = distance(worldCamProjPosition, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      vec3 color = mix(cellColor, sectionColor, min(1.0, sectionThickness * g2));

      gl_FragColor = vec4(color, (g1 + g2) * pow(d, fadeStrength));
      gl_FragColor.a = mix(0.75 * gl_FragColor.a, gl_FragColor.a, g2);
      if (gl_FragColor.a <= 0.0) discard;

      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }
  `
)

export const Grid: RefComponent<THREE.Mesh, Omit<ThreeProps<'Mesh'>, 'args'> & GridProps> = (_props) => {
  const [props, rest] = processProps(
    _props,
    {
      cellColor: '#000000',
      sectionColor: '#2080ff',
      cellSize: 0.5,
      sectionSize: 1,
      followCamera: false,
      infiniteGrid: false,
      fadeDistance: 100,
      fadeStrength: 1,
      cellThickness: 0.5,
      sectionThickness: 1,
      side: THREE.BackSide,
    },
    [
      'ref',
      'args',
      'cellColor',
      'sectionColor',
      'cellSize',
      'sectionSize',
      'followCamera',
      'infiniteGrid',
      'fadeDistance',
      'fadeStrength',
      'cellThickness',
      'sectionThickness',
      'side',
    ]
  )

  extend({ GridMaterial })

  const meshRef = createRef<THREE.Mesh>(null!)
  const plane = new THREE.Plane()
  const upVector = new THREE.Vector3(0, 1, 0)
  const zeroVector = new THREE.Vector3(0, 0, 0)
  useFrame((state) => {
    plane.setFromNormalAndCoplanarPoint(upVector, zeroVector).applyMatrix4(meshRef.ref.matrixWorld)

    const gridMaterial = meshRef.ref.material as THREE.ShaderMaterial
    const worldCamProjPosition = gridMaterial.uniforms.worldCamProjPosition as THREE.Uniform<THREE.Vector3>
    const worldPlanePosition = gridMaterial.uniforms.worldPlanePosition as THREE.Uniform<THREE.Vector3>

    plane.projectPoint(state.camera.position, worldCamProjPosition.value)
    worldPlanePosition.value.set(0, 0, 0).applyMatrix4(meshRef.ref.matrixWorld)
  })

  const [uniforms1] = splitProps(props, [
    'cellSize',
    'sectionSize',
    'cellColor',
    'sectionColor',
    'cellThickness',
    'sectionThickness',
  ])

  const [uniforms2] = splitProps(props, ['fadeDistance', 'fadeStrength', 'infiniteGrid', 'followCamera'])

  return (
    <T.Mesh ref={mergeRefs(props, meshRef)} frustumCulled={false} {...rest}>
      <T.GridMaterial transparent extensions-derivatives side={props.side} {...uniforms1} {...uniforms2} />
      <T.PlaneGeometry args={props.args} />
    </T.Mesh>
  )
}
