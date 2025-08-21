/** Based on
      https://github.com/Fyrestar/InfiniteGridHelper by https://github.com/Fyrestar
      and https://github.com/threlte/threlte/blob/main/packages/extras/src/lib/components/Grid/Grid.svelte
        by https://github.com/grischaerbe and https://github.com/jerzakm
*/

import { version } from '@/utils/constants'
import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { splitProps } from 'solid-js'
import type { S3 } from 'solid-three'
import { createT, Entity, useFrame } from 'solid-three'
import type { ColorRepresentation, ShaderMaterial, Side, Uniform } from 'three'
import { BackSide, Color, Mesh, Plane, PlaneGeometry, Vector3 } from 'three'
import { shaderMaterial } from '../materials/shaderMaterial'

export interface GridMaterialType {
  /** Cell size, default: 0.5 */
  cellSize?: number
  /** Cell thickness, default: 0.5 */
  cellThickness?: number
  /** Cell color, default: black */
  cellColor?: ColorRepresentation
  /** Section size, default: 1 */
  sectionSize?: number
  /** Section thickness, default: 1 */
  sectionThickness?: number
  /** Section color, default: #2080ff */
  sectionColor?: ColorRepresentation
  /** Follow camera, default: false */
  followCamera?: boolean
  /** Display the grid infinitely, default: false */
  infiniteGrid?: boolean
  /** Fade distance, default: 100 */
  fadeDistance?: number
  /** Fade strength, default: 1 */
  fadeStrength?: number
  /** Material side, default: BackSide */
  side?: Side
}

/**********************************************************************************/
/*                                                                                */
/*                                  Grid Material                                 */
/*                                                                                */
/**********************************************************************************/

const GridMaterial = shaderMaterial(
  {
    cellSize: 0.5,
    sectionSize: 1,
    fadeDistance: 100,
    fadeStrength: 1,
    cellThickness: 0.5,
    sectionThickness: 1,
    cellColor: new Color(),
    sectionColor: new Color(),
    infiniteGrid: false,
    followCamera: false,
    worldCamProjPosition: new Vector3(),
    worldPlanePosition: new Vector3(),
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
      #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
    }
  `,
)

const T = createT({ GridMaterial, PlaneGeometry })

/**********************************************************************************/
/*                                                                                */
/*                                       Grid                                     */
/*                                                                                */
/**********************************************************************************/

type GridPropsBase = Omit<S3.Props<typeof Mesh>, 'args'> & GridMaterialType
export interface GridProps extends GridPropsBase {
  ref?: Ref<Mesh>
  args?: S3.Props<typeof PlaneGeometry>['args']
}

export function Grid(props: GridProps) {
  const [config, rest] = processProps(
    props,
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
      side: BackSide,
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
    ],
  )
  const [uniforms1] = splitProps(config, [
    'cellSize',
    'sectionSize',
    'cellColor',
    'sectionColor',
    'cellThickness',
    'sectionThickness',
  ])
  const [uniforms2] = splitProps(config, [
    'fadeDistance',
    'fadeStrength',
    'infiniteGrid',
    'followCamera',
  ])

  const mesh = new Mesh()
  const plane = new Plane()
  const upVector = new Vector3(0, 1, 0)
  const zeroVector = new Vector3(0, 0, 0)

  useFrame(state => {
    plane.setFromNormalAndCoplanarPoint(upVector, zeroVector).applyMatrix4(mesh.matrixWorld)

    const gridMaterial = mesh.material as ShaderMaterial

    if (!gridMaterial) {
      return
    }

    const worldCamProjPosition = gridMaterial.uniforms.worldCamProjPosition as Uniform<Vector3>
    const worldPlanePosition = gridMaterial.uniforms.worldPlanePosition as Uniform<Vector3>

    if (!worldCamProjPosition || !worldPlanePosition) {
      return
    }

    plane.projectPoint(state.camera.position, worldCamProjPosition.value)
    worldPlanePosition.value.set(0, 0, 0).applyMatrix4(mesh.matrixWorld)
  })

  useRef(config, mesh)

  return (
    <Entity from={mesh} frustumCulled={false} {...rest}>
      <Entity
        from={GridMaterial}
        transparent
        extensions-derivatives
        side={config.side}
        {...uniforms1}
        {...uniforms2}
      />
      <T.PlaneGeometry args={config.args} />
    </Entity>
  )
}
