/** Author: @N8Programs https://github.com/N8python
 *    https://github.com/N8python/caustics
 */

import { version } from '@/utils/constants'
import { processProps } from '@/utils/process-props'
import { useRef } from '@/utils/use-refs'
import type { Ref } from 'solid-js'
import { createEffect as onMount, Show } from 'solid-js'
import type { S3 } from 'solid-three'
import { createT, useFrame, useThree } from 'solid-three'
import {
  BackSide,
  Box3,
  CameraHelper,
  Color,
  CustomBlending,
  FloatType,
  FrontSide,
  Frustum,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshNormalMaterial,
  Object3D,
  OneFactor,
  OrthographicCamera,
  Plane,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SrcAlphaFactor,
  Texture,
  UnsignedByteType,
  Vector3,
  type WebGLProgramParametersWithUniforms,
} from 'three'
import { FullScreenQuad } from 'three-stdlib'
import { shaderMaterial } from '../materials/shaderMaterial'
import { Edges } from './Edges'
import { useFBO } from './unported/useFBO'
import { useHelper } from './useHelper'

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

function createVectorArray() {
  return Array.from({ length: 8 }, () => new Vector3()) as [
    Vector3,
    Vector3,
    Vector3,
    Vector3,
    Vector3,
    Vector3,
    Vector3,
    Vector3,
  ]
}

function createNormalMaterial(side = FrontSide) {
  const viewMatrix = { value: new Matrix4() }
  return Object.assign(new MeshNormalMaterial({ side }) as CausticsProjectionMaterialType, {
    viewMatrix,
    onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
      shader.uniforms.viewMatrix = viewMatrix
      shader.fragmentShader =
        `vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
           return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
         }\n` +
        shader.fragmentShader.replace(
          '#include <normal_fragment_maps>',
          `#include <normal_fragment_maps>
           normal = inverseTransformDirection( normal, viewMatrix );\n`,
        )
    },
  })
}

/**********************************************************************************/
/*                                                                                */
/*                          Caustics Projection Material                          */
/*                                                                                */
/**********************************************************************************/

interface CausticsProjectionMaterialType extends MeshNormalMaterial {
  viewMatrix: { value?: Matrix4 }
  color?: Color
  causticsTexture?: Texture
  causticsTextureB?: Texture
  lightProjMatrix?: Matrix4
  lightViewMatrix?: Matrix4
}

const CausticsProjectionMaterial = shaderMaterial(
  {
    causticsTexture: null,
    causticsTextureB: null,
    color: new Color(),
    lightProjMatrix: new Matrix4(),
    lightViewMatrix: new Matrix4(),
  },
  `varying vec3 vWorldPosition;   
   void main() {
     gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
     vec4 worldPosition = modelMatrix * vec4(position, 1.);
     vWorldPosition = worldPosition.xyz;
   }`,
  `varying vec3 vWorldPosition;
  uniform vec3 color;
  uniform sampler2D causticsTexture; 
  uniform sampler2D causticsTextureB; 
  uniform mat4 lightProjMatrix;
  uniform mat4 lightViewMatrix;
   void main() {
    // Apply caustics  
    vec4 lightSpacePos = lightProjMatrix * lightViewMatrix * vec4(vWorldPosition, 1.0);
    lightSpacePos.xyz /= lightSpacePos.w;
    lightSpacePos.xyz = lightSpacePos.xyz * 0.5 + 0.5; 
    vec3 front = texture2D(causticsTexture, lightSpacePos.xy).rgb;
    vec3 back = texture2D(causticsTextureB, lightSpacePos.xy).rgb;
    gl_FragColor = vec4((front + back) * color, 1.0);
    #include <tonemapping_fragment>
    #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
   }`,
)

const CausticsMaterial = shaderMaterial(
  {
    cameraMatrixWorld: new Matrix4(),
    cameraProjectionMatrixInv: new Matrix4(),
    normalTexture: null,
    depthTexture: null,
    lightDir: new Vector3(0, 1, 0),
    lightPlaneNormal: new Vector3(0, 1, 0),
    lightPlaneConstant: 0,
    near: 0.1,
    far: 100,
    modelMatrix: new Matrix4(),
    worldRadius: 1 / 40,
    ior: 1.1,
    bounces: 0,
    resolution: 1024,
    size: 10,
    intensity: 0.5,
  },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  /* glsl */ `  
  uniform mat4 cameraMatrixWorld;
  uniform mat4 cameraProjectionMatrixInv;
  uniform vec3 lightDir;
  uniform vec3 lightPlaneNormal;
  uniform float lightPlaneConstant;
  uniform float near;
  uniform float far;
  uniform float time;
  uniform float worldRadius;
  uniform float resolution;
  uniform float size;
  uniform float intensity;
  uniform float ior;
  precision highp isampler2D;
  precision highp usampler2D;
  uniform sampler2D normalTexture;
  uniform sampler2D depthTexture;
  uniform float bounces;
  varying vec2 vUv;
  vec3 WorldPosFromDepth(float depth, vec2 coord) {
    float z = depth * 2.0 - 1.0;
    vec4 clipSpacePosition = vec4(coord * 2.0 - 1.0, z, 1.0);
    vec4 viewSpacePosition = cameraProjectionMatrixInv * clipSpacePosition;
    // Perspective division
    viewSpacePosition /= viewSpacePosition.w;
    vec4 worldSpacePosition = cameraMatrixWorld * viewSpacePosition;
    return worldSpacePosition.xyz;
  }                  
  float sdPlane( vec3 p, vec3 n, float h ) {
    // n must be normalized
    return dot(p,n) + h;
  }
  float planeIntersect( vec3 ro, vec3 rd, vec4 p ) {
    return -(dot(ro,p.xyz)+p.w)/dot(rd,p.xyz);
  }
  vec3 totalInternalReflection(vec3 ro, vec3 rd, vec3 pos, vec3 normal, float ior, out vec3 rayOrigin, out vec3 rayDirection) {
    rayOrigin = ro;
    rayDirection = rd;
    rayDirection = refract(rayDirection, normal, 1.0 / ior);
    rayOrigin = pos + rayDirection * 0.1;
    return rayDirection;
  }
  void main() {
    // Each sample consists of random offset in the x and y direction
    float caustic = 0.0;
    float causticTexelSize = (1.0 / resolution) * size * 2.0;
    float texelsNeeded = worldRadius / causticTexelSize;
    float sampleRadius = texelsNeeded / resolution;
    float sum = 0.0;
    if (texture2D(depthTexture, vUv).x == 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    vec2 offset1 = vec2(-0.5, -0.5);//vec2(rand() - 0.5, rand() - 0.5);
    vec2 offset2 = vec2(-0.5, 0.5);//vec2(rand() - 0.5, rand() - 0.5);
    vec2 offset3 = vec2(0.5, 0.5);//vec2(rand() - 0.5, rand() - 0.5);
    vec2 offset4 = vec2(0.5, -0.5);//vec2(rand() - 0.5, rand() - 0.5);
    vec2 uv1 = vUv + offset1 * sampleRadius;
    vec2 uv2 = vUv + offset2 * sampleRadius;
    vec2 uv3 = vUv + offset3 * sampleRadius;
    vec2 uv4 = vUv + offset4 * sampleRadius;
    vec3 normal1 = texture2D(normalTexture, uv1, -10.0).rgb * 2.0 - 1.0;
    vec3 normal2 = texture2D(normalTexture, uv2, -10.0).rgb * 2.0 - 1.0;
    vec3 normal3 = texture2D(normalTexture, uv3, -10.0).rgb * 2.0 - 1.0;
    vec3 normal4 = texture2D(normalTexture, uv4, -10.0).rgb * 2.0 - 1.0;
    float depth1 = texture2D(depthTexture, uv1, -10.0).x;
    float depth2 = texture2D(depthTexture, uv2, -10.0).x;
    float depth3 = texture2D(depthTexture, uv3, -10.0).x;
    float depth4 = texture2D(depthTexture, uv4, -10.0).x;
    // Sanity check the depths
    if (depth1 == 1.0 || depth2 == 1.0 || depth3 == 1.0 || depth4 == 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    vec3 pos1 = WorldPosFromDepth(depth1, uv1);
    vec3 pos2 = WorldPosFromDepth(depth2, uv2);
    vec3 pos3 = WorldPosFromDepth(depth3, uv3);
    vec3 pos4 = WorldPosFromDepth(depth4, uv4);
    vec3 originPos1 = WorldPosFromDepth(0.0, uv1);
    vec3 originPos2 = WorldPosFromDepth(0.0, uv2);
    vec3 originPos3 = WorldPosFromDepth(0.0, uv3);
    vec3 originPos4 = WorldPosFromDepth(0.0, uv4);
    vec3 endPos1, endPos2, endPos3, endPos4;
    vec3 endDir1, endDir2, endDir3, endDir4;
    totalInternalReflection(originPos1, lightDir, pos1, normal1, ior, endPos1, endDir1);
    totalInternalReflection(originPos2, lightDir, pos2, normal2, ior, endPos2, endDir2);
    totalInternalReflection(originPos3, lightDir, pos3, normal3, ior, endPos3, endDir3);
    totalInternalReflection(originPos4, lightDir, pos4, normal4, ior, endPos4, endDir4);
    float lightPosArea = length(cross(originPos2 - originPos1, originPos3 - originPos1)) + length(cross(originPos3 - originPos1, originPos4 - originPos1));
    float t1 = planeIntersect(endPos1, endDir1, vec4(lightPlaneNormal, lightPlaneConstant));
    float t2 = planeIntersect(endPos2, endDir2, vec4(lightPlaneNormal, lightPlaneConstant));
    float t3 = planeIntersect(endPos3, endDir3, vec4(lightPlaneNormal, lightPlaneConstant));
    float t4 = planeIntersect(endPos4, endDir4, vec4(lightPlaneNormal, lightPlaneConstant));
    vec3 finalPos1 = endPos1 + endDir1 * t1;
    vec3 finalPos2 = endPos2 + endDir2 * t2;
    vec3 finalPos3 = endPos3 + endDir3 * t3;
    vec3 finalPos4 = endPos4 + endDir4 * t4;
    float finalArea = length(cross(finalPos2 - finalPos1, finalPos3 - finalPos1)) + length(cross(finalPos3 - finalPos1, finalPos4 - finalPos1));
    caustic += intensity * (lightPosArea / finalArea);
    // Calculate the area of the triangle in light spaces
    gl_FragColor = vec4(vec3(max(caustic, 0.0)), 1.0);
  }`,
)

/**********************************************************************************/
/*                                                                                */
/*                                  Create Local T                                */
/*                                                                                */
/**********************************************************************************/

const T = createT({
  CausticsProjectionMaterial,
  Group,
  LineBasicMaterial,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
})

/**********************************************************************************/
/*                                                                                */
/*                                    Caustics                                    */
/*                                                                                */
/**********************************************************************************/

interface CausticsMaterialType extends ShaderMaterial {
  cameraMatrixWorld?: Matrix4
  cameraProjectionMatrixInv?: Matrix4
  lightPlaneNormal?: Vector3
  lightPlaneConstant?: number
  normalTexture?: Texture | null
  depthTexture?: Texture | null
  lightDir?: Vector3
  near?: number
  far?: number
  modelMatrix?: Matrix4
  worldRadius?: number
  ior?: number
  bounces?: number
  resolution?: number
  size?: number
  intensity?: number
}

interface CausticsProps extends S3.Props<Group> {
  ref?: Ref<Scene>
  /** How many frames it will render, set it to Infinity for runtime, default: 1 */
  frames?: number
  /** Enables visual cues to help you stage your scene, default: false */
  debug?: boolean
  /** Will display caustics only and skip the models, default: false */
  causticsOnly?: boolean
  /** Will include back faces and enable the backsideIOR prop, default: false */
  backside?: boolean
  /** The IOR refraction index, default: 1.1 */
  ior?: number
  /** The IOR refraction index for back faces (only available when backside is enabled), default: 1.1 */
  backsideIOR?: number
  /** The texel size, default: 0.3125 */
  worldRadius?: number
  /** Intensity of the prjected caustics, default: 0.05 */
  intensity?: number
  /** Caustics color, default: white */
  color?: S3.Color
  /** Buffer resolution, default: 2048 */
  resolution?: number
  /** Camera position, it will point towards the contents bounds center, default: [5, 5, 5] */
  lightSource?: [x: number, y: number, z: number] | Object3D
}

const NORMALPROPS = {
  depth: true,
  minFilter: LinearFilter,
  magFilter: LinearFilter,
  type: UnsignedByteType,
}

const CAUSTICPROPS = {
  minFilter: LinearMipmapLinearFilter,
  magFilter: LinearFilter,
  type: FloatType,
  generateMipmaps: true,
}

export function Caustics(props: CausticsProps) {
  const [config, rest] = processProps(
    props,
    {
      frames: 1,
      ior: 1.1,
      color: 'white',
      causticsOnly: false,
      backside: false,
      backsideIOR: 1.1,
      worldRadius: 0.3125,
      intensity: 0.05,
      resolution: 2024,
      lightSource: [5, 5, 5],
    },
    [
      'ref',
      'debug',
      'children',
      'frames',
      'ior',
      'color',
      'causticsOnly',
      'backside',
      'backsideIOR',
      'worldRadius',
      'intensity',
      'resolution',
      'lightSource',
    ],
  )
  const store = useThree()
  const helper = useHelper(() => (config.debug ? camera : undefined), CameraHelper)

  let camera: OrthographicCamera = null!
  let count = 0
  let plane: Mesh<PlaneGeometry, CausticsProjectionMaterialType> = null!
  let scene: Scene = null!
  let ref: Scene = null!

  const bounds = new Box3()
  const boundsVertices = createVectorArray()
  const cameraPosition = new Vector3()
  // The quad that catches the caustics
  const causticsMaterial = new CausticsMaterial() as CausticsMaterialType
  const causticsQuad = new FullScreenQuad(causticsMaterial)
  const focusPosition = new Vector3()
  const lightDirection = new Vector3()
  const lightDirectionInverted = new Vector3()
  const lightDirections = createVectorArray()
  const lightProjectionFrustum = new Frustum()
  const lightProjectionMatrix = new Matrix4()
  const lightProjectionPlane = new Plane()
  // Normal materials for front and back faces
  const normalMaterial = createNormalMaterial()
  const normalMaterialB = createNormalMaterial(BackSide)
  const projectedVertices = createVectorArray()
  const vector = new Vector3()
  const worldVertices = createVectorArray()

  // Buffers for front and back faces
  const normalTarget = useFBO(
    () => config.resolution,
    () => config.resolution,
    NORMALPROPS,
  )
  const normalTargetB = useFBO(
    () => config.resolution,
    () => config.resolution,
    NORMALPROPS,
  )
  const causticsTarget = useFBO(
    () => config.resolution,
    () => config.resolution,
    CAUSTICPROPS,
  )
  const causticsTargetB = useFBO(
    () => config.resolution,
    () => config.resolution,
    CAUSTICPROPS,
  )

  useFrame(() => {
    if (config.frames === Infinity || count++ < config.frames) {
      if (Array.isArray(config.lightSource))
        lightDirection.fromArray(config.lightSource).normalize()
      else
        lightDirection.copy(
          scene.worldToLocal(config.lightSource.getWorldPosition(vector)).normalize(),
        )

      lightDirectionInverted.copy(lightDirection).multiplyScalar(-1)

      scene.parent?.matrixWorld.identity()
      bounds.setFromObject(scene, true)
      boundsVertices[0].set(bounds.min.x, bounds.min.y, bounds.min.z)
      boundsVertices[1].set(bounds.min.x, bounds.min.y, bounds.max.z)
      boundsVertices[2].set(bounds.min.x, bounds.max.y, bounds.min.z)
      boundsVertices[3].set(bounds.min.x, bounds.max.y, bounds.max.z)
      boundsVertices[4].set(bounds.max.x, bounds.min.y, bounds.min.z)
      boundsVertices[5].set(bounds.max.x, bounds.min.y, bounds.max.z)
      boundsVertices[6].set(bounds.max.x, bounds.max.y, bounds.min.z)
      boundsVertices[7].set(bounds.max.x, bounds.max.y, bounds.max.z)

      for (let i = 0; i < 8; i++) {
        worldVertices[i]!.copy(boundsVertices[i]!)
      }

      bounds.getCenter(focusPosition)
      boundsVertices.forEach(v => v.sub(focusPosition))
      const lightPlane = lightProjectionPlane.set(lightDirectionInverted, 0)

      boundsVertices.forEach((v, i) => lightPlane.projectPoint(v, projectedVertices[i]!))

      const centralVert = projectedVertices
        .reduce((a, b) => a.add(b), vector.set(0, 0, 0))
        .divideScalar(projectedVertices.length)
      const radius = projectedVertices
        .map(v => v.distanceTo(centralVert))
        .reduce((a, b) => Math.max(a, b))
      const dirLength = boundsVertices
        .map(x => x.dot(lightDirection))
        .reduce((a, b) => Math.max(a, b))
      // Shadows
      camera.position.copy(
        cameraPosition.copy(lightDirection).multiplyScalar(dirLength).add(focusPosition),
      )
      camera.lookAt(scene.localToWorld(focusPosition))
      const directionMatrix = lightProjectionMatrix.lookAt(
        camera.position,
        focusPosition,
        vector.set(0, 1, 0),
      )
      camera.left = -radius
      camera.right = radius
      camera.top = radius
      camera.bottom = -radius
      const yOffset = vector.set(0, radius, 0).applyMatrix4(directionMatrix)
      const yTime = (camera.position.y + yOffset.y) / lightDirection.y
      camera.near = 0.1
      camera.far = yTime
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()

      // Now find size of ground plane
      const groundProjectedCoords = worldVertices.map((v, i) =>
        v.add(lightDirections[i]!.copy(lightDirection).multiplyScalar(-v.y / lightDirection.y)),
      )
      const centerPos = groundProjectedCoords
        .reduce((a, b) => a.add(b), vector.set(0, 0, 0))
        .divideScalar(groundProjectedCoords.length)
      const maxSize =
        2 *
        groundProjectedCoords
          .map(v => Math.hypot(v.x - centerPos.x, v.z - centerPos.z))
          .reduce((a, b) => Math.max(a, b))
      plane.scale.setScalar(maxSize)
      plane.position.copy(centerPos)

      if (config.debug) helper()?.update()

      // Inject uniforms
      normalMaterialB.viewMatrix.value = normalMaterial.viewMatrix.value = camera.matrixWorldInverse

      const dirLightNearPlane = lightProjectionFrustum.setFromProjectionMatrix(
        lightProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
      ).planes[4]!

      causticsMaterial.cameraMatrixWorld = camera.matrixWorld
      causticsMaterial.cameraProjectionMatrixInv = camera.projectionMatrixInverse
      causticsMaterial.lightDir = lightDirectionInverted

      causticsMaterial.lightPlaneNormal = dirLightNearPlane.normal
      causticsMaterial.lightPlaneConstant = dirLightNearPlane.constant

      causticsMaterial.near = camera.near
      causticsMaterial.far = camera.far
      causticsMaterial.resolution = config.resolution
      causticsMaterial.size = radius
      causticsMaterial.intensity = config.intensity
      causticsMaterial.worldRadius = config.worldRadius

      // Switch the scene on
      scene.visible = true

      // Render front face normals
      store.gl.setRenderTarget(normalTarget)
      store.gl.clear()
      scene.overrideMaterial = normalMaterial
      store.gl.render(scene, camera)

      // Render back face normals, if enabled
      store.gl.setRenderTarget(normalTargetB)
      store.gl.clear()
      if (config.backside) {
        scene.overrideMaterial = normalMaterialB
        store.gl.render(scene, camera)
      }

      // Remove the override material
      scene.overrideMaterial = null

      // Render front face caustics
      causticsMaterial.ior = config.ior
      plane.material.lightProjMatrix = camera.projectionMatrix
      plane.material.lightViewMatrix = camera.matrixWorldInverse
      causticsMaterial.normalTexture = normalTarget.texture
      causticsMaterial.depthTexture = normalTarget.depthTexture
      store.gl.setRenderTarget(causticsTarget)
      store.gl.clear()
      causticsQuad.render(store.gl)

      // Render back face caustics, if enabled
      causticsMaterial.ior = config.backsideIOR
      causticsMaterial.normalTexture = normalTargetB.texture
      causticsMaterial.depthTexture = normalTargetB.depthTexture
      store.gl.setRenderTarget(causticsTargetB)
      store.gl.clear()
      if (config.backside) causticsQuad.render(store.gl)

      // Reset render target
      store.gl.setRenderTarget(null)

      // Switch the scene off if caustics is all that's wanted
      if (config.causticsOnly) scene.visible = false
    }
  })

  onMount(() => scene?.updateWorldMatrix(false, true))

  useRef(config, scene)

  return (
    <T.Group {...rest}>
      <T.Scene ref={scene}>
        <T.OrthographicCamera ref={camera} up={[0, 1, 0]} />
        {config.children}
      </T.Scene>
      <T.Mesh renderOrder={2} ref={plane} rotation-x={-Math.PI / 2}>
        <T.PlaneGeometry />
        <T.CausticsProjectionMaterial
          transparent
          color={config.color}
          causticsTexture={causticsTarget.texture}
          causticsTextureB={causticsTargetB.texture}
          blending={CustomBlending}
          blendSrc={OneFactor}
          blendDst={SrcAlphaFactor}
          depthWrite={false}
        />
        <Show when={config.debug}>
          <Edges>
            <T.LineBasicMaterial color="#ffff00" toneMapped={false} />
          </Edges>
        </Show>
      </T.Mesh>
    </T.Group>
  )
}
