import { processProps } from '@/utils'
import { createEffect, createMemo, type JSX } from 'solid-js'
import { useThree } from 'solid-three'
import * as THREE from 'three'
import { EXRLoader, RGBELoader } from 'three-stdlib'

const PRESETS = {
  apartment: 'lebombo_1k.hdr',
  city: 'potsdamer_platz_1k.hdr',
  dawn: 'kiara_1_dawn_1k.hdr',
  forest: 'forest_slope_1k.hdr',
  lobby: 'st_fagans_interior_1k.hdr',
  night: 'dikhololo_night_1k.hdr',
  park: 'rooitou_1k.hdr',
  studio: 'studio_small_03_1k.hdr',
  sunset: 'venice_sunset_1k.hdr',
  warehouse: 'empty_warehouse_01_1k.hdr',
} as const

const PRESET_CDN = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/'

export type EnvironmentPreset = keyof typeof PRESETS

export interface EnvironmentProps {
  /** Path to HDR/EXR/cube texture file, or a preset name */
  files?: string | string[] | EnvironmentPreset
  /** Path prefix for cube textures (array of 6 filenames) */
  path?: string
  /** Apply as scene background. 'only' means background only, not env */
  background?: boolean | 'only'
  /** Background blur (0–1) */
  blur?: number
  /** Target scene, defaults to the current scene */
  scene?: THREE.Scene
  /** Color space for the texture (e.g. THREE.SRGBColorSpace) */
  colorSpace?: THREE.ColorSpace
  children?: JSX.Element
}

function isPreset(value: string): value is EnvironmentPreset {
  return value in PRESETS
}

async function loadEnvironmentTexture(
  files: string | string[],
  path: string,
  gl: THREE.WebGLRenderer,
): Promise<THREE.Texture> {
  const pmrem = new THREE.PMREMGenerator(gl)
  pmrem.compileEquirectangularShader()

  if (Array.isArray(files)) {
    const loader = new THREE.CubeTextureLoader().setPath(path)
    const cubeTexture = await loader.loadAsync(files)
    const texture = pmrem.fromCubemap(cubeTexture).texture
    pmrem.dispose()
    cubeTexture.dispose()
    return texture
  }

  const ext = files.split('.').pop()?.toLowerCase()
  if (ext === 'exr') {
    const loader = new EXRLoader().setPath(path)
    const tex = await loader.loadAsync(files)
    tex.mapping = THREE.EquirectangularReflectionMapping
    const texture = pmrem.fromEquirectangular(tex).texture
    pmrem.dispose()
    tex.dispose()
    return texture
  }

  const loader = new RGBELoader().setPath(path)
  const tex = await loader.loadAsync(files)
  tex.mapping = THREE.EquirectangularReflectionMapping
  const texture = pmrem.fromEquirectangular(tex).texture
  pmrem.dispose()
  tex.dispose()
  return texture
}

export function Environment(_props: EnvironmentProps) {
  const [props] = processProps(
    _props,
    {
      files: 'apartment' as string | string[] | EnvironmentPreset,
      path: '',
      background: false as boolean | 'only',
      blur: 0,
    },
    ['files', 'path', 'background', 'blur', 'scene', 'colorSpace'],
  )

  const store = useThree()

  const resolvedFiles = () => {
    const f = props.files
    if (typeof f === 'string' && isPreset(f)) {
      return PRESET_CDN + PRESETS[f]
    }
    return f as string | string[]
  }

  const resolvedPath = () => {
    const f = props.files
    if (typeof f === 'string' && isPreset(f)) return ''
    return props.path ?? ''
  }

  const texture = createMemo(async () => {
    return loadEnvironmentTexture(resolvedFiles(), resolvedPath(), store.gl)
  })

  createEffect(
    () => [texture(), props.background, props.blur] as const,
    ([tex, background, blur]) => {
      if (!tex) return

      const scene = props.scene ?? store.scene
      const prevEnv = scene.environment
      const prevBg = scene.background

      if (background !== 'only') scene.environment = tex
      if (background) scene.background = tex
      if (blur !== undefined && blur > 0) scene.backgroundBlurriness = blur

      return () => {
        scene.environment = prevEnv
        scene.background = prevBg
        tex.dispose()
      }
    },
  )

  return null
}
