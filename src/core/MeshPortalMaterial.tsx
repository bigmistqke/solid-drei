// Authors:
//   N8, https://twitter.com/N8Programs
//   drcmda, https://twitter.com/0xca0a
// https://github.com/N8python/maskBlur

import { processProps } from '@/utils'
import { createEffect, createMemo, createRenderEffect, createSignal, type JSX } from 'solid-js'
import { Entity, Portal, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { FullScreenQuad } from 'three-stdlib'
import { shaderMaterial } from '../materials/shaderMaterial'
import { RenderTexture } from './RenderTexture'
import { useFBO } from './useFBO'
import { useIntersect } from './useIntersect'

const PortalMaterialImpl = shaderMaterial(
  {
    blur: 0,
    map: null as unknown as THREE.Texture,
    sdf: null as unknown as THREE.Texture,
    blend: 0,
    size: 0,
    resolution: new THREE.Vector2(),
  },
  `varying vec2 vUv;
   void main() {
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
     vUv = uv;
   }`,
  `uniform sampler2D sdf;
   uniform sampler2D map;
   uniform float blur;
   uniform float size;
   uniform float time;
   uniform vec2 resolution;
   varying vec2 vUv;
   #include <packing>
   void main() {
     vec2 uv = gl_FragCoord.xy / resolution.xy;
     vec4 t = texture2D(map, uv);
     float k = blur;
     float d = texture2D(sdf, vUv).r/size;
     float alpha = 1.0 - smoothstep(0.0, 1.0, clamp(d/k + 1.0, 0.0, 1.0));
     gl_FragColor = vec4(t.rgb, blur == 0.0 ? t.a : t.a * alpha);
     #include <tonemapping_fragment>
     #include <encodings_fragment>
   }`,
)

export type PortalMaterialType = InstanceType<typeof PortalMaterialImpl>

export type PortalProps = {
  ref?: (ref: PortalMaterialType) => void
  children?: JSX.Element
  /** Mix the portals own scene with the world scene, 0 = world scene render,
   *  0.5 = both scenes render, 1 = portal scene renders, defaults to 0 */
  blend?: number
  /** Edge fade blur, 0 = no blur (default) */
  blur?: number
  /** SDF resolution, the smaller the faster is the start-up time (default: 512) */
  resolution?: number
  /** By default portals use relative coordinates, contents are affected by the local matrix transform */
  worldUnits?: boolean
  /** Optional event priority, defaults to 0 */
  eventPriority?: number
  /** Optional render priority, defaults to 0 */
  renderPriority?: number
  /** Optionally disable events inside the portal, defaults to false */
  events?: boolean
}

export const MeshPortalMaterial = (_props: PortalProps) => {
  const [props] = processProps(
    _props,
    {
      blur: 0,
      eventPriority: 0,
      renderPriority: 0,
      worldUnits: false,
      resolution: 512,
    },
    [
      'ref',
      'children',
      'events',
      'blur',
      'eventPriority',
      'renderPriority',
      'worldUnits',
      'resolution',
    ],
  )

  let materialRef: PortalMaterialType = null!
  const store = useThree()
  const maskRenderTarget = useFBO(props.resolution, props.resolution)

  const [priority, setPriority] = createSignal(0)

  useFrame(() => {
    if (materialRef) {
      const p = materialRef.blend > 0 ? Math.max(1, props.renderPriority) : 0
      if (priority() !== p) setPriority(p)
    }
  })

  const [visible, setVisible] = createSignal(true)
  const [_visRef, setVisRef] = useIntersect(setVisible)

  createRenderEffect(
    () => materialRef,
    (m) => {
      if (!m) return

      if (props.blur && !m.sdf) {
        const parent = (m as unknown as { __r3f?: { parent: THREE.Mesh } }).__r3f?.parent
        if (!parent || !(parent instanceof THREE.Mesh) || !parent.geometry) return

        const tempMesh = new THREE.Mesh(parent.geometry, new THREE.MeshBasicMaterial())
        const boundingBox = new THREE.Box3().setFromBufferAttribute(
          tempMesh.geometry.attributes.position as THREE.BufferAttribute,
        )
        const orthoCam = new THREE.OrthographicCamera(
          boundingBox.min.x * (1 + 2 / props.resolution),
          boundingBox.max.x * (1 + 2 / props.resolution),
          boundingBox.max.y * (1 + 2 / props.resolution),
          boundingBox.min.y * (1 + 2 / props.resolution),
          0.1,
          1000,
        )
        orthoCam.position.set(0, 0, 1)
        orthoCam.lookAt(0, 0, 0)

        store.gl.setRenderTarget(maskRenderTarget)
        store.gl.render(tempMesh, orthoCam)
        const sg = makeSDFGenerator(props.resolution, props.resolution, store.gl)
        const sdf = sg(maskRenderTarget.texture)
        const readSdf = new Float32Array(props.resolution * props.resolution)
        store.gl.readRenderTargetPixels(sdf, 0, 0, props.resolution, props.resolution, readSdf)
        let min = Infinity
        for (let i = 0; i < readSdf.length; i++) {
          if (readSdf[i] < min) min = readSdf[i]
        }
        min = -min
        m.size = min
        m.sdf = sdf.texture
        store.gl.setRenderTarget(null)
      }
    }
  )

  createEffect(
    () => materialRef,
    (m) => {
      props.ref?.(m)
    }
  )

  const material = new PortalMaterialImpl() as unknown as PortalMaterialType
  material.blend = 0
  material.blur = props.blur

  createEffect(
    () => [store.bounds.width, store.bounds.height] as const,
    ([width, height]) => {
      if (materialRef) {
        materialRef.resolution.set(width, height)
      }
    }
  )

  return (
    <Entity
      from={material as unknown as THREE.ShaderMaterial}
      ref={(m: THREE.ShaderMaterial) => { materialRef = m as unknown as PortalMaterialType }}
      attach="material"
    >
      <RenderTexture
        attach="map"
        frames={visible() ? Infinity : 0}
        eventPriority={props.eventPriority}
        renderPriority={props.renderPriority}
      >
        {props.children}
        <ManagePortalScene
          events={props.events}
          rootScene={store.scene}
          priority={priority()}
          material={() => materialRef}
          worldUnits={props.worldUnits}
        />
      </RenderTexture>
    </Entity>
  )
}

function ManagePortalScene(props: {
  events?: boolean
  rootScene: THREE.Scene
  material: () => PortalMaterialType | null
  priority: number
  worldUnits: boolean
}) {
  const store = useThree()
  const buffer1 = useFBO()
  const buffer2 = useFBO()

  createRenderEffect(
    () => store,
    (s) => {
      s.scene.matrixAutoUpdate = false
    }
  )

  const memo = createMemo(() => {
    const blend = { value: 0 }
    const quad = new FullScreenQuad(
      new THREE.ShaderMaterial({
        uniforms: {
          a: { value: buffer1.texture },
          b: { value: buffer2.texture },
          blend,
        },
        vertexShader: /*glsl*/ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }`,
        fragmentShader: /*glsl*/ `
          uniform sampler2D a;
          uniform sampler2D b;
          uniform float blend;
          varying vec2 vUv;
          #include <packing>
          void main() {
            vec4 ta = texture2D(a, vUv);
            vec4 tb = texture2D(b, vUv);
            gl_FragColor = mix(tb, ta, blend);
            #include <encodings_fragment>
          }`,
      }),
    )
    return { quad, blend }
  })

  useFrame(
    (state) => {
      const material = props.material()
      const parent = material
        ? (material as unknown as { __r3f?: { parent: THREE.Object3D } }).__r3f?.parent
        : null
      if (parent) {
        if (!props.worldUnits) {
          if (props.priority && material?.blend === 1) parent.updateWorldMatrix(true, false)
          store.scene.matrixWorld.copy(parent.matrixWorld)
        } else {
          store.scene.matrixWorld.identity()
        }

        if (props.priority) {
          if (material && material.blend > 0 && material.blend < 1) {
            memo().blend.value = material.blend
            state.gl.setRenderTarget(buffer1)
            state.gl.render(store.scene, state.camera)
            state.gl.setRenderTarget(buffer2)
            state.gl.render(props.rootScene, state.camera)
            state.gl.setRenderTarget(null)
            memo().quad.render(state.gl)
          } else if (material?.blend === 1) {
            state.gl.render(store.scene, state.camera)
          }
        }
      }
    },
    { priority: props.priority },
  )
  return <></>
}

const makeSDFGenerator = (clientWidth: number, clientHeight: number, renderer: THREE.WebGLRenderer) => {
  const finalTarget = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.FloatType,
    format: THREE.RedFormat,
    generateMipmaps: true,
  })
  const outsideRenderTarget = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  })
  const insideRenderTarget = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  })
  const outsideRenderTarget2 = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  })
  const insideRenderTarget2 = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
  })
  const outsideRenderTargetFinal = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    type: THREE.FloatType,
    format: THREE.RedFormat,
  })
  const insideRenderTargetFinal = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    type: THREE.FloatType,
    format: THREE.RedFormat,
  })
  const uvRender = new FullScreenQuad(
    new THREE.ShaderMaterial({
      uniforms: { tex: { value: null } },
      vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: /*glsl*/ `
        uniform sampler2D tex;
        varying vec2 vUv;
        #include <packing>
        void main() {
          gl_FragColor = pack2HalfToRGBA(vUv * (round(texture2D(tex, vUv).x)));
        }`,
    }),
  )
  const uvRenderInside = new FullScreenQuad(
    new THREE.ShaderMaterial({
      uniforms: { tex: { value: null } },
      vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: /*glsl*/ `
        uniform sampler2D tex;
        varying vec2 vUv;
        #include <packing>
        void main() {
          gl_FragColor = pack2HalfToRGBA(vUv * (1.0 - round(texture2D(tex, vUv).x)));
        }`,
    }),
  )
  const jumpFloodRender = new FullScreenQuad(
    new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: null },
        offset: { value: 0.0 },
        level: { value: 0.0 },
        maxSteps: { value: 0.0 },
      },
      vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D tex;
        uniform float offset;
        uniform float level;
        uniform float maxSteps;
        #include <packing>
        void main() {
          float closestDist = 9999999.9;
          vec2 closestPos = vec2(0.0);
          for (float x = -1.0; x <= 1.0; x += 1.0) {
            for (float y = -1.0; y <= 1.0; y += 1.0) {
              vec2 voffset = vUv;
              voffset += vec2(x, y) * vec2(${1 / clientWidth}, ${1 / clientHeight}) * offset;
              vec2 pos = unpackRGBATo2Half(texture2D(tex, voffset));
              float dist = distance(pos.xy, vUv);
              if(pos.x != 0.0 && pos.y != 0.0 && dist < closestDist) {
                closestDist = dist;
                closestPos = pos;
              }
            }
          }
          gl_FragColor = pack2HalfToRGBA(closestPos);
        }`,
    }),
  )
  const distanceFieldRender = new FullScreenQuad(
    new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: null },
        size: { value: new THREE.Vector2(clientWidth, clientHeight) },
      },
      vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D tex;
        uniform vec2 size;
        #include <packing>
        void main() {
          gl_FragColor = vec4(distance(size * unpackRGBATo2Half(texture2D(tex, vUv)), size * vUv), 0.0, 0.0, 0.0);
        }`,
    }),
  )
  const compositeRender = new FullScreenQuad(
    new THREE.ShaderMaterial({
      uniforms: {
        inside: { value: insideRenderTargetFinal.texture },
        outside: { value: outsideRenderTargetFinal.texture },
        tex: { value: null },
      },
      vertexShader: /*glsl*/ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: /*glsl*/ `
        varying vec2 vUv;
        uniform sampler2D inside;
        uniform sampler2D outside;
        uniform sampler2D tex;
        #include <packing>
        void main() {
          float i = texture2D(inside, vUv).x;
          float o =texture2D(outside, vUv).x;
          if (texture2D(tex, vUv).x == 0.0) {
            gl_FragColor = vec4(o, 0.0, 0.0, 0.0);
          } else {
            gl_FragColor = vec4(-i, 0.0, 0.0, 0.0);
          }
        }`,
    }),
  )

  return (image: THREE.Texture) => {
    const ft = finalTarget
    image.minFilter = THREE.NearestFilter
    image.magFilter = THREE.NearestFilter
    uvRender.material.uniforms.tex.value = image
    renderer.setRenderTarget(outsideRenderTarget)
    uvRender.render(renderer)

    const passes = Math.ceil(Math.log(Math.max(clientWidth, clientHeight)) / Math.log(2.0))
    let lastTarget: THREE.WebGLRenderTarget = outsideRenderTarget
    let target: THREE.WebGLRenderTarget = outsideRenderTarget
    for (let i = 0; i < passes; i++) {
      const offset = Math.pow(2, passes - i - 1)
      target = lastTarget === outsideRenderTarget ? outsideRenderTarget2 : outsideRenderTarget
      jumpFloodRender.material.uniforms.level.value = i
      jumpFloodRender.material.uniforms.maxSteps.value = passes
      jumpFloodRender.material.uniforms.offset.value = offset
      jumpFloodRender.material.uniforms.tex.value = lastTarget.texture
      renderer.setRenderTarget(target)
      jumpFloodRender.render(renderer)
      lastTarget = target
    }
    renderer.setRenderTarget(outsideRenderTargetFinal)
    distanceFieldRender.material.uniforms.tex.value = target.texture
    distanceFieldRender.render(renderer)
    uvRenderInside.material.uniforms.tex.value = image
    renderer.setRenderTarget(insideRenderTarget)
    uvRenderInside.render(renderer)
    lastTarget = insideRenderTarget

    for (let i = 0; i < passes; i++) {
      const offset = Math.pow(2, passes - i - 1)
      target = lastTarget === insideRenderTarget ? insideRenderTarget2 : insideRenderTarget
      jumpFloodRender.material.uniforms.level.value = i
      jumpFloodRender.material.uniforms.maxSteps.value = passes
      jumpFloodRender.material.uniforms.offset.value = offset
      jumpFloodRender.material.uniforms.tex.value = lastTarget.texture
      renderer.setRenderTarget(target)
      jumpFloodRender.render(renderer)
      lastTarget = target
    }
    renderer.setRenderTarget(insideRenderTargetFinal)
    distanceFieldRender.material.uniforms.tex.value = target.texture
    distanceFieldRender.render(renderer)
    renderer.setRenderTarget(ft)
    compositeRender.material.uniforms.tex.value = image
    compositeRender.render(renderer)
    renderer.setRenderTarget(null)
    return ft
  }
}
